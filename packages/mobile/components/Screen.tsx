import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-haru-paper dark:bg-haru-ink">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-semibold text-haru-ink dark:text-haru-paper tracking-tight">
              {title}
            </Text>
            {subtitle && <Text className="mt-1 text-sm text-haru-muted">{subtitle}</Text>}
          </View>
          {user && (
            <Pressable onPress={() => void signOut()} className="px-3 py-1">
              <Text className="text-xs text-haru-muted">로그아웃</Text>
            </Pressable>
          )}
        </View>
        <View className="mt-8">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
