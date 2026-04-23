import { Platform } from "react-native";
import { api } from "./api";

/**
 * 푸시 토큰 등록 스캐폴드.
 *
 * 네이티브 의존성(expo-notifications)은 v1에선 번들 충돌을 피하기 위해
 * 주석 처리. 실 배포 빌드에서는 아래처럼 동적 import 후 token 등록한다:
 *
 *   const Notifications = await import("expo-notifications");
 *   const { status } = await Notifications.requestPermissionsAsync();
 *   if (status !== "granted") return;
 *   const token = (await Notifications.getExpoPushTokenAsync()).data;
 *   await api.registerPushToken({ token, platform });
 */
export async function registerPushTokenIfPossible(): Promise<void> {
  try {
    const platform = (Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web") as
      | "ios"
      | "android"
      | "web";

    // 개발 환경에선 고정 스텁 토큰으로 서버 흐름만 검증.
    if (__DEV__) {
      const stub = `dev-${platform}-${Math.random().toString(36).slice(2, 10)}`;
      await api.registerPushToken({ token: stub, platform, deviceLabel: "dev stub" });
    }
  } catch {
    // 등록 실패는 치명적이지 않으므로 무시
  }
}
