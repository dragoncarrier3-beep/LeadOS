import { useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaceholderScreen() {
  const route = useRoute();
  const title = route.name;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>Coming in a later phase.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  box: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', textAlign: 'center' },
});
