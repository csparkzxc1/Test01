import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export default function RegisterScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    if (!privacyAgreed || !termsAgreed) {
      setError("필수 약관에 동의해 주세요");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.register({ email, password, nickname, privacyAgreed, termsAgreed, marketingOptIn });
      await refresh();
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("가입 실패");
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
          <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight mb-2">
            회원가입
          </Text>
          <Text className="text-sm text-haru-muted mb-8">한 줄 할 일로 오늘을 시작해요.</Text>

          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임"
            placeholderTextColor="#8E8E93"
            maxLength={40}
            className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper mb-3"
          />
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
            className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper"
          />

          <Checkbox
            value={termsAgreed}
            onChange={setTermsAgreed}
            label="이용약관에 동의합니다"
            required
          />
          <Checkbox
            value={privacyAgreed}
            onChange={setPrivacyAgreed}
            label="개인정보 처리방침에 동의합니다"
            required
          />
          <Checkbox
            value={marketingOptIn}
            onChange={setMarketingOptIn}
            label="마케팅 정보 수신 (선택)"
          />

          {error && <Text className="mt-3 text-xs text-red-500">{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={submitting}
            className="mt-5 rounded-xl bg-haru-accent py-3 items-center"
          >
            <Text className="text-white text-[15px] font-medium">
              {submitting ? "가입 중…" : "가입하고 시작하기"}
            </Text>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-haru-muted">이미 계정이 있으신가요? </Text>
            <Link href="/login" className="text-sm text-haru-accent">
              로그인
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Checkbox({
  value,
  onChange,
  label,
  required = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="mt-3 flex-row items-start gap-2"
    >
      <View
        className={`mt-0.5 h-5 w-5 rounded border items-center justify-center ${
          value ? "bg-haru-accent border-haru-accent" : "border-haru-muted"
        }`}
      >
        {value && <Text className="text-white text-xs">✓</Text>}
      </View>
      <Text className="text-sm text-haru-ink dark:text-haru-paper flex-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
    </Pressable>
  );
}
