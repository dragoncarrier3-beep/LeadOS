import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type LeadRow = {
  id: string;
  name: string;
  vehicle: string;
  status: string;
  received_at: string;
};

export default function LeadsScreen() {
  const { user, signOut } = useAuth();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setError(null);
    const { data, error: qErr } = await supabase
      .from('leads')
      .select('id,name,vehicle,status,received_at')
      .eq('salesperson_id', user.id)
      .order('received_at', { ascending: false });

    if (qErr) setError(qErr.message);
    else setRows((data ?? []) as LeadRow[]);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.title}>Configure Supabase</Text>
          <Text style={styles.sub}>
            Copy mobile/.env.example to mobile/.env and set EXPO_PUBLIC_SUPABASE_URL and
            EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <View>
          <Text style={styles.logo}>Replik</Text>
          <Text style={styles.welcome}>Your leads</Text>
        </View>
        <Pressable onPress={() => void signOut()} hitSlop={8}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF5C00" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errTitle}>Unable to load leads</Text>
          <Text style={styles.sub}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={rows.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C00" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No leads</Text>
              <Text style={styles.sub}>
                When leads are assigned to you, they will appear here. A later phase will add email
                ingestion and webhooks.
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardVeh}>{item.vehicle}</Text>
              <Text style={styles.cardMeta}>{item.status}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  logo: { fontSize: 22, fontWeight: '900', color: '#FF5C00', letterSpacing: -0.8 },
  welcome: { marginTop: 4, fontSize: 12, color: '#555', fontWeight: '700', letterSpacing: 0.3 },
  signOut: { fontSize: 13, fontWeight: '700', color: '#FF5C00', paddingTop: 6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  errTitle: { fontSize: 18, fontWeight: '700', color: '#F87171', marginBottom: 8 },
  sub: { fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 18 },
  list: { padding: 16, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  empty: { alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 10 },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  cardName: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  cardVeh: { marginTop: 3, fontSize: 11, color: '#555', fontWeight: '600' },
  cardMeta: { marginTop: 8, fontSize: 10, fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: 1.2 },
});
