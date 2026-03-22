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
import { clearSearchHistory } from "../utils/storage";
import { Fonts, Shadow } from "../theme";

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

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: Colors.border, backgroundColor: Colors.bg }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: Colors.bgCard, borderColor: Colors.border }]}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Text style={[styles.backArrow, { color: Colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: Colors.text }]}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Avatar card */}
                <View style={[styles.avatarCard, { backgroundColor: Colors.bgCard, borderColor: Colors.border }]}>
                    <AvatarCircle name={user?.name || "Guest"} size={88} accent={Colors.accent} />
                    <Text style={[styles.userName, { color: Colors.text }]}>{user?.name || "Guest"}</Text>
                    {!isGuest && user?.email ? (
                        <Text style={[styles.userEmail, { color: Colors.textMuted }]}>{user.email}</Text>
                    ) : (
                        <View style={[styles.guestBadge, { backgroundColor: Colors.accentLight }]}>
                            <Text style={[styles.guestBadgeText, { color: Colors.accent }]}>Guest Mode</Text>
                        </View>
                    )}
                </View>

                {/* Account details */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard, borderColor: Colors.border }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>ACCOUNT DETAILS</Text>
                    {infoRows.map((row, i) => (
                        <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.borderFaint }]}>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>{row.label}</Text>
                            <Text style={[styles.infoValue, { color: Colors.text }]}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Preferences */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard, borderColor: Colors.border }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>PREFERENCES</Text>

                    {/* Dark mode toggle */}
                    <View style={[styles.infoRow, { borderBottomWidth: 1, borderBottomColor: Colors.borderFaint }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</Text>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: Colors.border, true: Colors.accent }}
                            thumbColor="#fff"
                            accessibilityLabel="Toggle dark mode"
                        />
                    </View>

                    {/* Clear search history */}
                    <TouchableOpacity style={styles.infoRow} onPress={handleClearHistory} accessibilityLabel="Clear search history" accessibilityRole="button">
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 18 }}>🗑️</Text>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>Clear Search History</Text>
                        </View>
                        <Text style={{ color: Colors.textFaint, fontSize: 16 }}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* App info */}
                <View style={[styles.infoCard, { backgroundColor: Colors.bgCard, borderColor: Colors.border }]}>
                    <Text style={[styles.sectionLabel, { color: Colors.textFaint }]}>APP INFO</Text>
                    {[
                        { label: "Version", value: "1.0.0" },
                        { label: "Data Source", value: "Simulated (USCIS)" },
                        { label: "Last Sync", value: new Date().toLocaleTimeString() },
                    ].map((row, i) => (
                        <View key={row.label} style={[styles.infoRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: Colors.borderFaint }]}>
                            <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>{row.label}</Text>
                            <Text style={[styles.infoValue, { color: Colors.text }]}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Sign out */}
                <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={handleSignOut}
                    activeOpacity={0.8}
                    accessibilityLabel={isGuest ? "Exit guest mode" : "Sign out"}
                    accessibilityRole="button"
                >
                    <Text style={styles.signOutText}>
                        {isGuest ? "🚪 Exit Guest Mode" : "🚪 Sign Out"}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    backArrow: { fontSize: 18 },
    headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: Fonts.sansBold },

    scroll: { padding: 20, paddingTop: 24 },

    avatarCard: {
        ...Shadow.cardStrong,
        borderRadius: 24, padding: 28,
        alignItems: "center", marginBottom: 16,
        borderWidth: 1,
    },
    avatar: { alignItems: "center", justifyContent: "center", marginBottom: 14 },
    avatarText: { color: "#fff", fontWeight: "800", fontFamily: Fonts.sansBold },
    userName: { fontSize: 22, fontWeight: "800", fontFamily: Fonts.sansBold, marginBottom: 4 },
    userEmail: { fontSize: 14, fontFamily: Fonts.sans },
    guestBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
    guestBadgeText: { fontSize: 12, fontWeight: "600", fontFamily: Fonts.sansSemiBold },

    infoCard: {
        ...Shadow.card,
        borderRadius: 20, padding: 20, marginBottom: 16,
        borderWidth: 1,
    },
    sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, fontFamily: Fonts.sansBold, marginBottom: 14 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
    infoLabel: { fontSize: 14, fontFamily: Fonts.sans },
    infoValue: { fontSize: 14, fontWeight: "600", fontFamily: Fonts.sansSemiBold },

    signOutBtn: {
        backgroundColor: "#FFF1F2", borderWidth: 1.5, borderColor: "#FECDD3",
        borderRadius: 16, paddingVertical: 16, alignItems: "center",
    },
    signOutText: { color: "#E11D48", fontSize: 15, fontWeight: "700", fontFamily: Fonts.sansBold },
});
