import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { parseKoreanEntry } from "@haru/shared";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { emitTasksChanged } from "../lib/events";

export function QuickEntry() {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = value.trim() ? parseKoreanEntry(value) : null;

  const submit = async () => {
    const raw = value.trim();
    if (!raw || submitting) return;
    if (!user) {
      setError("로그인 후 저장할 수 있습니다");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.quickEntry(raw);
      setValue("");
      emitTasksChanged();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="mb-6">
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        returnKeyType="done"
        editable={!submitting}
        placeholder='예: "내일 오후 3시 팀 회의 #회의"'
        placeholderTextColor="#8E8E93"
        className="px-4 py-3 rounded-xl border border-black/10 text-[15px] text-haru-ink dark:text-haru-paper"
      />
      {parsed && (
        <View className="mt-2 p-3 rounded-lg bg-black/5 dark:bg-white/10">
          <Text className="text-xs text-haru-muted">📝 {parsed.title}</Text>
          {parsed.when && (
            <Text className="text-xs text-haru-muted mt-0.5">
              📅 {new Date(parsed.when).toLocaleString("ko-KR")}
            </Text>
          )}
          {parsed.deadline && (
            <Text className="text-xs text-haru-muted mt-0.5">
              ⏰ 마감: {new Date(parsed.deadline).toLocaleString("ko-KR")}
            </Text>
          )}
          {parsed.tags.length > 0 && (
            <Text className="text-xs text-haru-muted mt-0.5">
              {parsed.tags.map((t: string) => `#${t}`).join(" ")}
            </Text>
          )}
        </View>
      )}
      {error && <Text className="mt-2 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
