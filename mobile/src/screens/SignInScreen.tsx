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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function onSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setErr(null);
    setBusy(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) setErr(error.message);
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
          <Text style={styles.logo}>Replik</Text>
          <Text style={styles.tag}>Sign in</Text>
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
            placeholder="Password"
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
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  logo: { fontSize: 28, fontWeight: '900', color: '#FF5C00', letterSpacing: -0.8 },
  tag: { marginTop: 8, fontSize: 16, color: '#555' },
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
  err: { color: '#F87171', fontSize: 14, marginBottom: 8 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: '#FF5C00', fontSize: 15, fontWeight: '700' },
});
