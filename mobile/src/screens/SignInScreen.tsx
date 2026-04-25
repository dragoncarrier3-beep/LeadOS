import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList } from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setErr(error.message);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>LeadOS</Text>
          <Text style={styles.tag}>Sign in to continue</Text>
        </View>
        <View style={styles.form}>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          <Text style={styles.lbl}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@dealer.com"
            placeholderTextColor="#64748B"
          />
          <Text style={styles.lbl}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#64748B"
          />
          <Pressable
            style={[styles.btn, busy && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={busy || !email.trim() || !password}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTx}>Sign in</Text>}
          </Pressable>
          <Pressable style={styles.linkWrap} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  logo: { fontSize: 28, fontWeight: '800', color: '#2563EB', letterSpacing: -0.5 },
  tag: { marginTop: 8, fontSize: 16, color: '#94A3B8' },
  form: { paddingHorizontal: 24, gap: 4 },
  lbl: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
  },
  btn: {
    marginTop: 28,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnTx: { color: '#fff', fontSize: 16, fontWeight: '700' },
  err: { color: '#F87171', fontSize: 14, marginBottom: 8 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },
});
