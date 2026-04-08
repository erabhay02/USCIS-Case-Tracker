import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Switch,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { clearSearchHistory } from "../utils/storage";
import { Fonts, Shadow } from "../theme";
import EmojiText from "../components/EmojiText";

function AvatarCircle({ name, size = 80, accent }) {
    const initials = name
        ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";
    return (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: accent }]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
    );
}

export default function ProfileScreen({ navigation }) {
    const { user, isGuest, signOut } = useAuth();
    const { Colors, isDark, toggleTheme } = useTheme();
    const { prefs, updatePrefs, enablePush, fetchPushToken } = useNotifications();

    const handleSignOut = () => {
        Alert.alert(
            isGuest ? "Exit Guest Mode" : "Sign Out",
            isGuest ? "You'll be taken back to the home screen." : "You'll need to sign in again next time.",
            [
                { text: "Cancel", style: "cancel" },
                { text: isGuest ? "Exit" : "Sign Out", style: "destructive", onPress: signOut },
            ]
        );
    };

    const handleClearHistory = () => {
        Alert.alert("Clear Search History", "This will remove all saved receipt searches.", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: () => clearSearchHistory() },
        ]);
    };

    const infoRows = isGuest
        ? [{ label: "Account Type", value: "Guest" }]
        : [
            { label: "Name", value: user?.name || "—" },
            { label: "Email", value: user?.email || "—" },
            { label: "Account Type", value: "Registered User" },
            { label: "Member Since", value: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
        ];

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: Colors.bg }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header — no bottom border, use bg shift */}
            <View style={[styles.header, { backgroundColor: Colors.bg }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: Colors.bgCard }]}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Text style={[styles.backArrow, { color: Colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: Colors.text }]}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Avatar card — white vessel on surface bg */}
                <View style={[styles.avatarCard, { backgroundColor: Colors.bgCard }]}>
                    <AvatarCircle name={user?.name || "Guest"} size={88} accent={Colors.accent} />
                    {/* Human first — name is the primary hook */}
                    <Text style={[styles.userName, { color: Colors.text }]}>{user?.name || "Guest"}</Text>
                    {!isGuest && user?.email ? (
                        <Text style={[styles.userEmail, { color: Colors.textMuted }]}>{user.email}</Text>
                    ) : (
                        <View style={[styles.guestBadge, { backgroundColor: Colors.pendingChipBg }]}>
                            <Text style={[styles.guestBadgeText, { color: Colors.pendingChipText }]}>Guest Mode</Text>
                        </View>
                    )}
                </View>

                {/* Account details — tonal card, no borders between rows */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>ACCOUNT DETAILS</Text>
                    {infoRows.map((row, i) => (
                        <View
                            key={row.label}
                            style={[
                                styles.infoRow,
                                i < infoRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.bgSection },
                            ]}
                        >
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>{row.label}</Text>
                            <Text style={[styles.infoValue, { color: Colors.text }]}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Preferences */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>PREFERENCES</Text>

                    <View style={[styles.infoRow, { borderBottomWidth: 1, borderBottomColor: Colors.bgSection }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <EmojiText size={18}>{isDark ? "🌙" : "☀️"}</EmojiText>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: Colors.bgSection, true: Colors.accent }}
                            thumbColor="#fff"
                            accessibilityLabel="Toggle dark mode"
                        />
                    </View>

                    <TouchableOpacity style={styles.infoRow} onPress={handleClearHistory} accessibilityLabel="Clear search history" accessibilityRole="button">
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <EmojiText size={18}>🗑️</EmojiText>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Clear Search History</Text>
                        </View>
                        <Text style={{ color: Colors.textFaint, fontSize: 16 }}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>NOTIFICATIONS</Text>

                    {/* Push Notifications toggle */}
                    <View style={[styles.infoRow, { borderBottomWidth: 1, borderBottomColor: Colors.bgSection }]}>
                        <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <EmojiText size={18}>🔔</EmojiText>
                                <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Push Notifications</Text>
                            </View>
                            <Text style={[styles.infoSubLabel, { color: Colors.textFaint }]}>
                                Alert me when my case status changes
                            </Text>
                        </View>
                        <Switch
                            value={prefs.pushEnabled}
                            onValueChange={async (val) => {
                                if (val) {
                                    await enablePush();
                                } else {
                                    updatePrefs({ pushEnabled: false, pollingEnabled: false });
                                }
                            }}
                            trackColor={{ false: Colors.bgSection, true: Colors.accent }}
                            thumbColor="#fff"
                            accessibilityLabel="Toggle push notifications"
                        />
                    </View>

                    {/* Background Polling toggle — only when push is on */}
                    <View style={[
                        styles.infoRow,
                        { borderBottomWidth: 1, borderBottomColor: Colors.bgSection },
                        !prefs.pushEnabled && { opacity: 0.4 },
                    ]}>
                        <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <EmojiText size={18}>🔄</EmojiText>
                                <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Background Polling</Text>
                            </View>
                            <Text style={[styles.infoSubLabel, { color: Colors.textFaint }]}>
                                Checks for status changes every 15 min
                            </Text>
                        </View>
                        <Switch
                            value={prefs.pollingEnabled}
                            disabled={!prefs.pushEnabled}
                            onValueChange={(val) => updatePrefs({ pollingEnabled: val })}
                            trackColor={{ false: Colors.bgSection, true: Colors.accent }}
                            thumbColor="#fff"
                            accessibilityLabel="Toggle background polling"
                        />
                    </View>

                    {/* Email Notifications toggle */}
                    <View style={[
                        styles.infoRow,
                        isGuest && { borderBottomWidth: 1, borderBottomColor: Colors.bgSection },
                        isGuest && { opacity: 0.4 },
                    ]}>
                        <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <EmojiText size={18}>📧</EmojiText>
                                <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Email Notifications</Text>
                            </View>
                            <Text style={[styles.infoSubLabel, { color: Colors.textFaint }]}>
                                {isGuest ? "Sign in to enable email alerts" : `Alerts sent to ${user?.email || "your email"}`}
                            </Text>
                        </View>
                        <Switch
                            value={prefs.emailEnabled}
                            disabled={isGuest}
                            onValueChange={(val) => {
                                updatePrefs({ emailEnabled: val });
                                if (val) {
                                    Alert.alert(
                                        "Email Alerts",
                                        "Your preference has been saved. Email delivery requires a connected backend service — we'll notify you when it goes live.",
                                        [{ text: "Got it" }]
                                    );
                                }
                            }}
                            trackColor={{ false: Colors.bgSection, true: Colors.accent }}
                            thumbColor="#fff"
                            accessibilityLabel="Toggle email notifications"
                        />
                    </View>

                    {/* Push Token row — dev/debug aid for backend wiring */}
                    {prefs.pushEnabled && !isGuest && (
                        <TouchableOpacity
                            style={styles.infoRow}
                            onPress={async () => {
                                const token = await fetchPushToken();
                                Alert.alert(
                                    "Expo Push Token",
                                    token || "Could not retrieve token. Make sure you are on a physical device.",
                                    [{ text: "OK" }]
                                );
                            }}
                            accessibilityLabel="Show push token"
                            accessibilityRole="button"
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <EmojiText size={18}>🔑</EmojiText>
                                <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Show Push Token</Text>
                            </View>
                            <Text style={{ color: Colors.textFaint, fontSize: 16 }}>›</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* App info */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>APP INFO</Text>
                    {[
                        { label: "Version", value: "1.0.0" },
                        { label: "Data Source", value: "Simulated (USCIS)" },
                        { label: "Last Sync", value: new Date().toLocaleTimeString() },
                    ].map((row, i) => (
                        <View
                            key={row.label}
                            style={[styles.infoRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: Colors.bgSection }]}
                        >
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>{row.label}</Text>
                            <Text style={[styles.infoValue, { color: Colors.text }]}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Sign out — destructive tonal button */}
                <TouchableOpacity
                    style={[styles.signOutBtn, { backgroundColor: Colors.deniedBg }]}
                    onPress={handleSignOut}
                    activeOpacity={0.8}
                    accessibilityLabel={isGuest ? "Exit guest mode" : "Sign out"}
                    accessibilityRole="button"
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <EmojiText size={16}>🚪</EmojiText>
                        <Text style={[styles.signOutText, { color: Colors.denied }]}>
                            {isGuest ? "Exit Guest Mode" : "Sign Out"}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },

    // Header — no border, bg shift provides separation
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 18, paddingVertical: 14,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", ...Shadow.card },
    backArrow: { fontSize: 18 },
    headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: Fonts.displayBold },

    scroll: { paddingHorizontal: 18, paddingTop: 8 },

    // Avatar card — white vessel, architectural shadow
    avatarCard: {
        ...Shadow.cardStrong,
        borderRadius: 12, padding: 28,
        alignItems: "center", marginBottom: 18,
    },
    avatar: { alignItems: "center", justifyContent: "center", marginBottom: 14 },
    avatarText: { color: "#fff", fontWeight: "800", fontFamily: Fonts.display },
    userName: { fontSize: 22, fontWeight: "800", fontFamily: Fonts.display, marginBottom: 4 },
    userEmail: { fontSize: 14, fontFamily: Fonts.sans },
    guestBadge: { borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 5 },
    guestBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: Fonts.sansSemiBold, letterSpacing: 0.3 },

    // Info cards — white vessels, rows separated by surface-container bg shift
    infoCard: {
        ...Shadow.card,
        borderRadius: 12, padding: 20, marginBottom: 16,
    },
    // Section labels — all-caps metadata style per design spec
    sectionLabel: {
        fontSize: 11, fontWeight: "700", letterSpacing: 0.8,
        fontFamily: Fonts.sansBold, marginBottom: 14,
        textTransform: "uppercase",
    },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
    infoLabel: { fontSize: 14, fontFamily: Fonts.sans },
    infoSubLabel: { fontSize: 11, fontFamily: Fonts.sans, marginLeft: 28 },
    infoValue: { fontSize: 14, fontWeight: "600", fontFamily: Fonts.sansSemiBold },

    signOutBtn: {
        borderRadius: 12, paddingVertical: 16, alignItems: "center",
    },
    signOutText: { fontSize: 15, fontWeight: "700", fontFamily: Fonts.displayBold },
});
