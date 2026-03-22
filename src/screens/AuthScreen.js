import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { Colors, Fonts } from "../theme";

const TAB_WELCOME = "welcome";
const TAB_SIGNIN = "signin";
const TAB_SIGNUP = "signup";

export default function AuthScreen() {
    const { signIn, signUp, continueAsGuest } = useAuth();
    const [tab, setTab] = useState(TAB_WELCOME);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignIn = () => {
        if (!email.trim()) { setError("Please enter your email."); return; }
        if (!password.trim()) { setError("Please enter your password."); return; }
        setError("");
        signIn({ name: email.split("@")[0], email: email.trim() });
    };

    const handleSignUp = () => {
        if (!name.trim()) { setError("Please enter your name."); return; }
        if (!email.trim()) { setError("Please enter your email."); return; }
        if (!password.trim()) { setError("Please enter a password."); return; }
        setError("");
        signUp({ name: name.trim(), email: email.trim() });
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View style={styles.logoRow}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoIcon}>⌗</Text>
                        </View>
                        <Text style={styles.logoText}>USCIS Tracker</Text>
                        {tab !== TAB_WELCOME && (
                            <TouchableOpacity onPress={() => { setTab(TAB_WELCOME); setError(""); }} style={styles.skipBtn}>
                                <Text style={styles.skipText}>Back</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Welcome Panel ── */}
                    {tab === TAB_WELCOME && (
                        <View style={styles.panel}>
                            {/* Big hero badge */}
                            <View style={styles.heroBadgeRow}>
                                <View style={[styles.heroBadge, { backgroundColor: Colors.lime }]}>
                                    <Text style={styles.heroBadgeIcon}>⚡</Text>
                                </View>
                                <View style={[styles.heroBadge, { backgroundColor: Colors.accentLight }]}>
                                    <Text style={styles.heroBadgeIcon}>📋</Text>
                                </View>
                            </View>

                            <Text style={styles.heroTitle}>
                                Track Your{"\n"}
                                <Text style={styles.heroTitleAccent}>USCIS Case</Text>
                                {"\n"}Intelligence
                            </Text>
                            <Text style={styles.heroSub}>
                                Real-time case status, neighbor scans, and approval trend analysis — all in one place.
                            </Text>

                            {/* Stats preview */}
                            <View style={styles.statsPreview}>
                                <View style={styles.statPreviewItem}>
                                    <Text style={styles.statPreviewNum}>93%</Text>
                                    <Text style={styles.statPreviewLabel}>Accuracy</Text>
                                </View>
                                <View style={styles.statPreviewDivider} />
                                <View style={styles.statPreviewItem}>
                                    <Text style={styles.statPreviewNum}>±20</Text>
                                    <Text style={styles.statPreviewLabel}>Case Scan</Text>
                                </View>
                                <View style={styles.statPreviewDivider} />
                                <View style={styles.statPreviewItem}>
                                    <Text style={styles.statPreviewNum}>5+</Text>
                                    <Text style={styles.statPreviewLabel}>Centers</Text>
                                </View>
                            </View>

                            {/* Primary CTA */}
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setTab(TAB_SIGNUP)} activeOpacity={0.85}>
                                <Text style={styles.primaryBtnText}>Let's get started!</Text>
                                <View style={styles.primaryBtnArrow}>
                                    <Text style={styles.primaryBtnArrowText}>→</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Sign in link */}
                            <TouchableOpacity onPress={() => setTab(TAB_SIGNIN)} style={styles.signinLink}>
                                <Text style={styles.signinLinkText}>
                                    Already have an account?{" "}
                                    <Text style={styles.signinLinkBold}>Sign in</Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Guest */}
                            <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
                                <Text style={styles.guestBtnText}>Continue as Guest</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Sign In Panel ── */}
                    {tab === TAB_SIGNIN && (
                        <View style={styles.panel}>
                            <Text style={styles.formTitle}>Welcome back</Text>
                            <Text style={styles.formSub}>Sign in to your account to continue</Text>

                            {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor={Colors.textFaint}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={Colors.textFaint}
                                secureTextEntry
                            />

                            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn} activeOpacity={0.85}>
                                <Text style={styles.primaryBtnText}>Sign In</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
                                <Text style={styles.guestBtnText}>Continue as Guest</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setTab(TAB_SIGNUP); setError(""); }} style={styles.switchLink}>
                                <Text style={styles.switchLinkText}>
                                    Don't have an account?{" "}
                                    <Text style={styles.switchLinkBold}>Sign up</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── Sign Up Panel ── */}
                    {tab === TAB_SIGNUP && (
                        <View style={styles.panel}>
                            <Text style={styles.formTitle}>Create account</Text>
                            <Text style={styles.formSub}>Start tracking your USCIS cases today</Text>

                            {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Jane Doe"
                                placeholderTextColor={Colors.textFaint}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />

                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor={Colors.textFaint}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={Colors.textFaint}
                                secureTextEntry
                            />

                            <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp} activeOpacity={0.85}>
                                <Text style={styles.primaryBtnText}>Create Account</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest} activeOpacity={0.7}>
                                <Text style={styles.guestBtnText}>Continue as Guest</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setTab(TAB_SIGNIN); setError(""); }} style={styles.switchLink}>
                                <Text style={styles.switchLinkText}>
                                    Already have an account?{" "}
                                    <Text style={styles.switchLinkBold}>Sign in</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 12 },

    // Logo
    logoRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        marginBottom: 32,
    },
    logoBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center",
    },
    logoIcon: { color: "#fff", fontSize: 18 },
    logoText: { flex: 1, fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: Fonts.sansBold },
    skipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
    skipText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },

    // Panel
    panel: { flex: 1 },

    // Welcome hero
    heroBadgeRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
    heroBadge: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    heroBadgeIcon: { fontSize: 24 },
    heroTitle: { fontSize: 38, fontWeight: "800", color: Colors.text, lineHeight: 46, marginBottom: 14, fontFamily: Fonts.sansBold },
    heroTitleAccent: { color: Colors.accent },
    heroSub: { fontSize: 15, color: Colors.textMuted, lineHeight: 23, marginBottom: 32, fontFamily: Fonts.sans },

    // Stats preview
    statsPreview: {
        flexDirection: "row", backgroundColor: Colors.bgCard,
        borderRadius: 20, padding: 20, marginBottom: 32,
        shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1, shadowRadius: 16, elevation: 4,
        borderWidth: 1, borderColor: Colors.border,
    },
    statPreviewItem: { flex: 1, alignItems: "center" },
    statPreviewNum: { fontSize: 22, fontWeight: "800", color: Colors.accent, fontFamily: Fonts.sansBold },
    statPreviewLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontFamily: Fonts.sans },
    statPreviewDivider: { width: 1, backgroundColor: Colors.border },

    // Primary button
    primaryBtn: {
        backgroundColor: Colors.text, borderRadius: 16,
        paddingVertical: 18, alignItems: "center", justifyContent: "center",
        flexDirection: "row", gap: 10, marginBottom: 16,
    },
    primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: Fonts.sansBold },
    primaryBtnArrow: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: Colors.lime, alignItems: "center", justifyContent: "center",
    },
    primaryBtnArrowText: { color: Colors.text, fontSize: 16, fontWeight: "800" },

    // Sign in link
    signinLink: { alignItems: "center", marginBottom: 12, paddingVertical: 8 },
    signinLinkText: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sans },
    signinLinkBold: { color: Colors.accent, fontWeight: "700", fontFamily: Fonts.sansBold },

    // Guest button
    guestBtn: {
        borderRadius: 16, paddingVertical: 16, alignItems: "center",
        borderWidth: 1.5, borderColor: Colors.border, marginBottom: 12,
    },
    guestBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: "600", fontFamily: Fonts.sansSemiBold },

    // Form
    formTitle: { fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 6, fontFamily: Fonts.sansBold },
    formSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 28, fontFamily: Fonts.sans },
    inputLabel: { fontSize: 12, fontWeight: "600", color: Colors.textSub, marginBottom: 8, fontFamily: Fonts.sansSemiBold, letterSpacing: 0.5 },
    input: {
        backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border,
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: Colors.text, fontFamily: Fonts.sans, marginBottom: 18,
    },
    errorBox: {
        backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FECDD3",
        borderRadius: 10, padding: 12, marginBottom: 16,
    },
    errorText: { color: "#E11D48", fontSize: 13, fontFamily: Fonts.sans },

    // Switch link
    switchLink: { alignItems: "center", paddingVertical: 12 },
    switchLinkText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },
    switchLinkBold: { color: Colors.accent, fontWeight: "700", fontFamily: Fonts.sansBold },
});
