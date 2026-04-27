import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
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
  const submittingRef = useRef(false);

  async function onSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error, needsEmailConfirmation } = await signUp(
        email.trim(),
        password,
        fullName.trim()
      );
      if (error) {
        const msg = error.message || 'Sign up failed. Please try again.';
        if (/rate limit/i.test(msg)) {
          setErr('Too many sign-up attempts. Please wait a few minutes and try again.');
        } else {
          setErr(msg);
        }
        return;
      }
      if (needsEmailConfirmation) {
        setInfo('Account created. Please check your email to confirm, then sign in.');
      } else {
        setInfo("Account created. You're signed in.");
      }
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
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
          <Text style={styles.logo}>Create an account</Text>
          <Text style={styles.tag}>Seller access</Text>
        </View>
        <View style={styles.form}>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
          <Text style={styles.lbl}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Smith"
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
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  back: { color: '#FF5C00', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  logo: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.4 },
  tag: { marginTop: 8, fontSize: 15, color: '#555' },
  form: { paddingHorizontal: 24, gap: 4 },
  lbl: { fontSize: 12, fontWeight: '700', color: '#444', marginTop: 12, letterSpacing: 0.2 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#181818',
  },
  btn: {
    marginTop: 28,
    backgroundColor: '#FF5C00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnTx: { color: '#fff', fontSize: 16, fontWeight: '700' },
  err: { color: '#F87171', fontSize: 14, marginBottom: 4 },
  info: { color: '#4ADE80', fontSize: 14, marginBottom: 4 },
});
