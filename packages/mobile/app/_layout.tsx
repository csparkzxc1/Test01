import "../global.css";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Slot, Tabs, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../lib/auth-context";

export default function Layout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    const inAuth = first === "login" || first === "register";
    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && inAuth) {
      router.replace("/");
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    // 로그인/가입 화면은 탭 없이 Stack 루트로 렌더
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: { borderTopColor: "rgba(0,0,0,0.05)" },
        tabBarLabelStyle: { fontSize: 11, letterSpacing: -0.2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "오늘" }} />
      <Tabs.Screen name="this-week" options={{ title: "이번주" }} />
      <Tabs.Screen name="upcoming" options={{ title: "예정" }} />
      <Tabs.Screen name="anytime" options={{ title: "언제든지" }} />
      <Tabs.Screen name="someday" options={{ title: "언젠가" }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
    </Tabs>
  );
}
