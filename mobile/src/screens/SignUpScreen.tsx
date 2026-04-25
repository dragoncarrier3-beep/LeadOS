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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setErr(null);
    setInfo(null);
    setBusy(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setInfo('Check your email to confirm your account, then sign in.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.logo}>Create account</Text>
          <Text style={styles.tag}>Salesperson access</Text>
        </View>
        <View style={styles.form}>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
          <Text style={styles.lbl}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jean Tremblay"
            placeholderTextColor="#64748B"
          />
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
            placeholder="At least 6 characters"
            placeholderTextColor="#64748B"
          />
          <Pressable
            style={[styles.btn, busy && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={busy || !email.trim() || !password || password.length < 6}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTx}>Sign up</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  back: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginBottom: 20 },
  logo: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  tag: { marginTop: 8, fontSize: 15, color: '#94A3B8' },
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
  err: { color: '#F87171', fontSize: 14, marginBottom: 4 },
  info: { color: '#4ADE80', fontSize: 14, marginBottom: 4 },
});
