import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export default function LoginScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email || !password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.login(email, password);
      await refresh();
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("로그인 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-6 pt-20">
          <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight mb-2">
            로그인
          </Text>
          <Text className="text-sm text-haru-muted mb-8">하루로 오늘을 정돈해 보세요.</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper mb-3"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 (8자 이상)"
            placeholderTextColor="#8E8E93"
            secureTextEntry
            autoComplete="current-password"
            className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper"
          />
          {error && <Text className="mt-3 text-xs text-red-500">{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={submitting}
            className="mt-5 rounded-xl bg-haru-accent py-3 items-center"
          >
            <Text className="text-white text-[15px] font-medium">
              {submitting ? "로그인 중…" : "로그인"}
            </Text>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-haru-muted">계정이 없으신가요? </Text>
            <Link href="/register" className="text-sm text-haru-accent">
              가입하기
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
