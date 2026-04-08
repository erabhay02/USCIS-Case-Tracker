import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { savePushToken } from "./storage";

// ── Foreground display behaviour ──────────────────────────────────────────────
export function setNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

// ── Android channel ───────────────────────────────────────────────────────────
export async function configureNotificationChannel() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("case-updates", {
            name: "Case Status Updates",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#003c87",
        });
    }
}

// ── Permission request ────────────────────────────────────────────────────────
export async function requestNotificationPermissions() {
    if (!Device.isDevice) return false; // simulators: skip
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

// ── Push token (for backend integration) ─────────────────────────────────────
export async function getExpoPushToken() {
    try {
        const granted = await requestNotificationPermissions();
        if (!granted) return null;
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        await savePushToken(token);
        return token;
    } catch {
        return null;
    }
}

// ── Local status-change notification ─────────────────────────────────────────
export async function scheduleStatusChangeNotification(receipt, oldLabel, newLabel) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `Case Update: ${receipt}`,
            body: `Status changed from "${oldLabel}" to "${newLabel}"`,
            data: { receipt },
            sound: true,
            badge: 1,
            channelId: "case-updates",
        },
        trigger: null, // deliver immediately
    });
}
