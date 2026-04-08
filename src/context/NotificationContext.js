import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { loadNotificationPrefs, saveNotificationPrefs } from "../utils/storage";
import {
    requestNotificationPermissions,
    getExpoPushToken,
} from "../utils/notifications";
import { registerBackgroundPoll, unregisterBackgroundPoll } from "../utils/backgroundPoll";

const NotificationContext = createContext(null);

const DEFAULT_PREFS = { pushEnabled: false, emailEnabled: false, pollingEnabled: false };

export function NotificationProvider({ children }) {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [pushToken, setPushToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted prefs on mount
    useEffect(() => {
        loadNotificationPrefs().then((p) => {
            setPrefs(p);
            setIsLoading(false);
        });
    }, []);

    // Sync background polling whenever pollingEnabled changes
    useEffect(() => {
        if (isLoading) return;
        if (prefs.pollingEnabled) {
            registerBackgroundPoll();
        } else {
            unregisterBackgroundPoll();
        }
    }, [prefs.pollingEnabled, isLoading]);

    // Merge-update prefs and persist
    const updatePrefs = useCallback(async (patch) => {
        setPrefs((prev) => {
            const next = { ...prev, ...patch };
            saveNotificationPrefs(next);
            return next;
        });
    }, []);

    // Enable push — request permission first
    const enablePush = useCallback(async () => {
        const granted = await requestNotificationPermissions();
        if (!granted) {
            Alert.alert(
                "Permission Required",
                "Push notifications are blocked. Please enable them in your device Settings → Notifications → USCIS Tracker.",
                [{ text: "OK" }]
            );
            return false;
        }
        await updatePrefs({ pushEnabled: true });
        return true;
    }, [updatePrefs]);

    // Fetch and expose the Expo push token
    const fetchPushToken = useCallback(async () => {
        const token = await getExpoPushToken();
        if (token) setPushToken(token);
        return token;
    }, []);

    return (
        <NotificationContext.Provider value={{ prefs, updatePrefs, enablePush, pushToken, fetchPushToken }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
    return ctx;
}
