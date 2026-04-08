import React, { useState, useMemo } from "react";
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
import { Fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import EmojiText from "../components/EmojiText";

const TAB_WELCOME = "welcome";
const TAB_SIGNIN = "signin";
const TAB_SIGNUP = "signup";

export default function AuthScreen() {
    const { signIn, signUp, continueAsGuest } = useAuth();
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);
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
                            <Text style={styles.logoIcon}>#</Text>
                        </View>
                        <Text style={styles.logoText}>USCIS Tracker</Text>
                        {tab !== TAB_WELCOME && (
                            <TouchableOpacity
                                onPress={() => { setTab(TAB_WELCOME); setError(""); }}
                                style={styles.skipBtn}
                            >
                                <Text style={styles.skipText}>Back</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Welcome Panel ── */}
                    {tab === TAB_WELCOME && (
                        <View style={styles.panel}>
                            {/* Hero badges */}
                            <View style={styles.heroBadgeRow}>
                                <View style={[styles.heroBadge, { backgroundColor: Colors.lime }]}>
                                    <EmojiText size={24}>⚡</EmojiText>
                                </View>
                                <View style={[styles.heroBadge, { backgroundColor: Colors.accentLight }]}>
                                    <EmojiText size={24}>📋</EmojiText>
                                </View>
                            </View>

                            {/* Editorial hero title — Manrope display */}
                            <Text style={styles.heroTitle}>
                                Track Your{"\n"}
                                <Text style={styles.heroTitleAccent}>USCIS Case</Text>
                                {"\n"}Intelligence
                            </Text>
                            <Text style={styles.heroSub}>
                                Real-time case status, neighbor scans, and approval trend analysis — all in one place.
                            </Text>

                            {/* Stats preview — tonal card, no border */}
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

                            <TouchableOpacity onPress={() => setTab(TAB_SIGNIN)} style={styles.signinLink}>
                                <Text style={styles.signinLinkText}>
                                    Already have an account?{" "}
                                    <Text style={styles.signinLinkBold}>Sign in</Text>
                                </Text>
                            </TouchableOpacity>

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

                            <Text style={styles.inputLabel}>EMAIL</Text>
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

                            <Text style={styles.inputLabel}>PASSWORD</Text>
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

                            <Text style={styles.inputLabel}>FULL NAME</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Jane Doe"
                                placeholderTextColor={Colors.textFaint}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />

                            <Text style={styles.inputLabel}>EMAIL</Text>
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

                            <Text style={styles.inputLabel}>PASSWORD</Text>
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

function makeStyles(Colors) {
    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.bg },
        scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },

        // Logo
        logoRow: {
            flexDirection: "row", alignItems: "center", gap: 10,
            marginBottom: 36,
        },
        logoBox: {
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center",
        },
        logoIcon: { color: "#fff", fontSize: 18, fontFamily: Fonts.monoBold, fontWeight: "700" },
        logoText: { flex: 1, fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: Fonts.displayBold },
        skipBtn: {
            paddingHorizontal: 14, paddingVertical: 8,
            borderRadius: 20, backgroundColor: Colors.bgCardAlt,
        },
        skipText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },

        panel: { flex: 1 },

        // Welcome hero — editorial Manrope display
        heroBadgeRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
        heroBadge: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
        heroBadgeIcon: { fontSize: 24 },
        heroTitle: {
            fontSize: 38, fontWeight: "800", color: Colors.text,
            lineHeight: 46, marginBottom: 14, fontFamily: Fonts.display,
        },
        heroTitleAccent: { color: Colors.accent },
        heroSub: { fontSize: 15, color: Colors.textMuted, lineHeight: 23, marginBottom: 32, fontFamily: Fonts.sans },

        // Stats — tonal layering, no border
        statsPreview: {
            flexDirection: "row",
            backgroundColor: Colors.bgCard,
            borderRadius: 16, padding: 20, marginBottom: 32,
            shadowColor: "#001a42", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
        },
        statPreviewItem: { flex: 1, alignItems: "center" },
        statPreviewNum: { fontSize: 22, fontWeight: "800", color: Colors.accent, fontFamily: Fonts.display },
        statPreviewLabel: {
            fontSize: 10, color: Colors.textMuted, marginTop: 4,
            fontFamily: Fonts.sans, textTransform: "uppercase", letterSpacing: 0.8,
        },
        statPreviewDivider: { width: 1, backgroundColor: Colors.bgSection },

        // Primary CTA — brand blue
        primaryBtn: {
            backgroundColor: Colors.accent, borderRadius: 14,
            paddingVertical: 18, alignItems: "center", justifyContent: "center",
            flexDirection: "row", gap: 10, marginBottom: 16,
        },
        primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: Fonts.displayBold },
        primaryBtnArrow: {
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: Colors.lime, alignItems: "center", justifyContent: "center",
        },
        primaryBtnArrowText: { color: Colors.limeText, fontSize: 16, fontWeight: "800" },

        signinLink: { alignItems: "center", marginBottom: 12, paddingVertical: 8 },
        signinLinkText: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sans },
        signinLinkBold: { color: Colors.accent, fontWeight: "700", fontFamily: Fonts.sansBold },

        // Guest button — minimal, no strong border
        guestBtn: {
            borderRadius: 14, paddingVertical: 16, alignItems: "center",
            backgroundColor: Colors.bgCardAlt, marginBottom: 12,
        },
        guestBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: "600", fontFamily: Fonts.sansSemiBold },

        // Form
        formTitle: { fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 6, fontFamily: Fonts.display },
        formSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 28, fontFamily: Fonts.sans },

        // Input labels — all-caps metadata style
        inputLabel: {
            fontSize: 11, fontWeight: "700", color: Colors.textFaint,
            marginBottom: 8, fontFamily: Fonts.sansSemiBold,
            letterSpacing: 0.8, textTransform: "uppercase",
        },
        // Minimalist input — surface-container-low fill, no box border
        input: {
            backgroundColor: Colors.bgInput,
            borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14,
            fontSize: 15, color: Colors.text, fontFamily: Fonts.sans, marginBottom: 18,
        },
        errorBox: {
            backgroundColor: Colors.deniedBg,
            borderRadius: 10, padding: 12, marginBottom: 16,
        },
        errorText: { color: Colors.denied, fontSize: 13, fontFamily: Fonts.sans },

        switchLink: { alignItems: "center", paddingVertical: 12 },
        switchLinkText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },
        switchLinkBold: { color: Colors.accent, fontWeight: "700", fontFamily: Fonts.sansBold },
    });
}
