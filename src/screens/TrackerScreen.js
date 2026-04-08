import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Share,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";

import ReceiptInput from "../components/ReceiptInput";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import Timeline from "../components/Timeline";
import NeighborTable from "../components/NeighborTable";
import EmojiText from "../components/EmojiText";

import {
    parseReceipt,
    randomStatus,
    generateNeighbors,
    FORM_TYPES,
    SERVICE_CENTERS,
    STATUSES,
} from "../utils/uscisHelpers";
import {
    loadTrackedCases, saveTrackedCases,
    loadSearchHistory, addToSearchHistory,
} from "../utils/storage";
import { Fonts, Shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { scheduleStatusChangeNotification } from "../utils/notifications";

// ── Avatar ─────────────────────────────────────────────────────────────────
function AvatarBtn({ name, onPress, styles }) {
    const initials = name
        ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";
    return (
        <TouchableOpacity onPress={onPress} style={styles.avatarBtn} activeOpacity={0.8}>
            <Text style={styles.avatarBtnText}>{initials}</Text>
        </TouchableOpacity>
    );
}

// ── Feature cards data ─────────────────────────────────────────────────────
const FEATURE_CARDS = [
    { icon: "⚡", bg: "#C1F135", title: "Instant Status", desc: "Paste your receipt and get your USCIS case status instantly." },
    { icon: "🔍", bg: "#e8f0fb", title: "±20 Case Scan", desc: "See neighboring cases filed at the same center on the same day." },
    { icon: "📊", bg: "#fff7ed", title: "Approval Stats", desc: "Know your odds — see approval, pending, and RFE rates." },
    { icon: "📌", bg: "#f0fdf4", title: "Case Tracking", desc: "Save multiple cases and monitor them all in one dashboard." },
];

// ── Main Screen ────────────────────────────────────────────────────────────
export default function TrackerScreen({ navigation }) {
    const { user, isGuest } = useAuth();
    const { Colors: themeColors } = useTheme();
    const { prefs } = useNotifications();
    const styles = useMemo(() => makeStyles(themeColors), [themeColors]);
    const scrollRef = useRef(null);
    const resultsY = useRef(0);

    const [receipt, setReceipt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [neighbors, setNeighbors] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [scanRange, setScanRange] = useState(10);
    const [trackedCases, setTrackedCases] = useState([]);
    const [, setSearchHistory] = useState([]);

    useEffect(() => {
        loadTrackedCases().then(setTrackedCases);
        loadSearchHistory().then(setSearchHistory);
    }, []);

    useEffect(() => {
        saveTrackedCases(trackedCases);
    }, [trackedCases]);

    const handleShare = useCallback(async () => {
        if (!result) return;
        const receiptFormatted = receipt.toUpperCase();
        const msg = `USCIS Case Status\nReceipt: ${receiptFormatted}\nStatus: ${result.status.label}\nForm: ${result.form} — ${result.formDesc}\nCenter: ${result.serviceCenter}\n\nTracked via USCIS Tracker App`;
        try {
            await Share.share({ message: msg, title: "USCIS Case Status" });
        } catch (e) {
            Alert.alert("Share failed", e.message);
        }
    }, [result, receipt]);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    const handleSearch = () => {
        setError("");
        const parsed = parseReceipt(receipt);
        if (!parsed) {
            setError("Invalid receipt number. Expected format: EAC-23-015-50023");
            return;
        }
        setLoading(true);
        setResult(null);
        setNeighbors([]);
        addToSearchHistory(receipt.toUpperCase()).then(setSearchHistory);

        setTimeout(() => {
            const status = randomStatus();
            const formKeys = Object.keys(FORM_TYPES);
            const form = formKeys[Math.floor(Math.random() * formKeys.length)];
            const fiscalYear = 2000 + parseInt(parsed.year);

            setResult({
                parsed, status, form,
                formDesc: FORM_TYPES[form],
                serviceCenter: SERVICE_CENTERS[parsed.prefix],
                filedDate: `${fiscalYear}-03-15`,
                lastUpdated: `${fiscalYear}-09-22`,
                center: parsed.prefix,
                history: [
                    { status: STATUSES[0], date: `${fiscalYear}-03-15`, receipt: receipt.toUpperCase() },
                    { status: STATUSES[1], date: `${fiscalYear}-05-02`, receipt: receipt.toUpperCase() },
                    ...(status.key !== "received" && status.key !== "processing"
                        ? [{ status, date: `${fiscalYear}-09-22`, receipt: receipt.toUpperCase() }]
                        : []),
                ],
            });
            setNeighbors(generateNeighbors(parsed, scanRange));

            // Fire a local notification if push is enabled and the case is
            // already tracked and its status has changed since last saved
            if (prefs.pushEnabled) {
                setTrackedCases((prev) => {
                    const key = receipt.toUpperCase();
                    const existing = prev.find((c) => c.receipt === key);
                    if (existing && existing.status.key !== status.key) {
                        scheduleStatusChangeNotification(key, existing.status.label, status.label);
                    }
                    return prev;
                });
            }

            setLoading(false);
            setActiveTab("overview");
            setTimeout(() => scrollRef.current?.scrollTo({ y: resultsY.current, animated: true }), 150);
        }, 1400);
    };

    const approvalRate = neighbors.length
        ? Math.round((neighbors.filter((n) => n.status.key === "approved").length / neighbors.length) * 100)
        : 0;
    const pendingRate = neighbors.length
        ? Math.round((neighbors.filter((n) => ["received", "processing", "rfe_issued", "rfe_received"].includes(n.status.key)).length / neighbors.length) * 100)
        : 0;
    const rfeRate = neighbors.length
        ? Math.round((neighbors.filter((n) => n.status.key === "rfe_issued").length / neighbors.length) * 100)
        : 0;

    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "neighbors", label: `±${scanRange} Cases` },
        { key: "timeline", label: "Timeline" },
        { key: "tracked", label: `Tracked (${trackedCases.length})` },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />

            {/* ── Sticky Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting()},</Text>
                    {/* Human over case number — name is the primary visual hook */}
                    <Text style={styles.userName}>
                        {isGuest ? "Guest" : user?.name || "there"}!
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.notifBtn}>
                        <EmojiText size={18}>🔔</EmojiText>
                    </View>
                    <AvatarBtn
                        name={user?.name || "Guest"}
                        onPress={() => navigation.navigate("Profile")}
                        styles={styles}
                    />
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Search Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Case Lookup</Text>
                    <ReceiptInput
                        value={receipt}
                        onChange={setReceipt}
                        onSearch={handleSearch}
                        loading={loading}
                    />

                    {!!error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠ {error}</Text>
                        </View>
                    )}

                    {/* Scan Range */}
                    <View style={styles.scanRow}>
                        <Text style={styles.scanLabel}>SCAN RANGE</Text>
                        <View style={styles.scanPills}>
                            {[5, 10, 20].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setScanRange(r)}
                                    style={[styles.scanPill, scanRange === r && styles.scanPillActive]}
                                >
                                    <Text style={[styles.scanPillText, scanRange === r && styles.scanPillTextActive]}>
                                        ±{r}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── Loading ── */}
                {loading && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={themeColors.accent} />
                        <Text style={styles.loadingText}>Querying USCIS database…</Text>
                        <Text style={styles.loadingSubText}>
                            Scanning {receipt.toUpperCase()} + ±{scanRange} neighbors
                        </Text>
                    </View>
                )}

                {/* ── Results ── */}
                {result && !loading && (
                    <View onLayout={(e) => { resultsY.current = e.nativeEvent.layout.y; }}>

                        {/* Case Header Card — left 4px pill + white surface */}
                        <View style={styles.caseCard}>
                            <View style={[styles.caseCardPill, { backgroundColor: result.status.color }]} />
                            <View style={styles.caseCardBody}>
                                <Text style={styles.caseReceiptLabel}>RECEIPT NUMBER</Text>
                                <Text style={styles.caseReceipt}>
                                    {result.parsed.full.replace(/[^A-Z0-9]/g, "").replace(/(.{3})(.{2})(.{3})(.{5})/, "$1-$2-$3-$4")}
                                </Text>
                                <StatusBadge status={result.status} size="lg" />

                                {/* Meta pills — surface-container-low bg */}
                                <View style={styles.metaRow}>
                                    {[
                                        { icon: "📋", label: result.form, sub: result.formDesc },
                                        { icon: "🏢", label: result.center, sub: result.serviceCenter },
                                        { icon: "📅", label: result.filedDate, sub: "Filed date" },
                                    ].map((m) => (
                                        <View key={m.label} style={styles.metaPill}>
                                            <EmojiText size={18}>{m.icon}</EmojiText>
                                            <View>
                                                <Text style={styles.metaPillVal}>{m.label}</Text>
                                                <Text style={styles.metaPillSub}>{m.sub}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Actions */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.actionBtnPrimary]}
                                        accessibilityLabel="Track this case"
                                        accessibilityRole="button"
                                        onPress={() => {
                                            const key = receipt.toUpperCase();
                                            if (!trackedCases.find((c) => c.receipt === key)) {
                                                setTrackedCases((prev) => [
                                                    ...prev,
                                                    { receipt: key, status: result.status, form: result.form, addedAt: new Date().toLocaleDateString() },
                                                ]);
                                            }
                                            setActiveTab("tracked");
                                        }}
                                    >
                                        <Text style={styles.actionBtnPrimaryText}>+ Track Case</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        accessibilityLabel="Copy receipt number"
                                        accessibilityRole="button"
                                        onPress={() => Clipboard.setStringAsync(receipt.toUpperCase())}
                                    >
                                        <Text style={styles.actionBtnText}>⎘ Copy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        accessibilityLabel="Share case status"
                                        accessibilityRole="button"
                                        onPress={handleShare}
                                    >
                                        <Text style={styles.actionBtnText}>↗ Share</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Stats row — pure white cards on surface bg */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                            <View style={{ flexDirection: "row", gap: 12, paddingRight: 8 }}>
                                <StatCard label="Cases Scanned" value={neighbors.length} sub={`±${scanRange} from yours`} />
                                <StatCard label="Approval Rate" value={`${approvalRate}%`} sub="Same day, same center" color={approvalRate > 50 ? themeColors.approved : approvalRate > 30 ? themeColors.pending : themeColors.denied} />
                                <StatCard label="Still Pending" value={`${pendingRate}%`} sub="In review" color={themeColors.accent} />
                                <StatCard label="RFE Rate" value={`${rfeRate}%`} sub="Request for evidence" color={themeColors.rfe} />
                            </View>
                        </ScrollView>

                        {/* Distribution card — tonal */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>APPROVAL DISTRIBUTION — ±{scanRange} CASES</Text>
                            <ProgressBar data={neighbors} />
                        </View>

                        {/* Overall Analysis CTA */}
                        <TouchableOpacity
                            style={styles.analysisBtn}
                            activeOpacity={0.85}
                            accessibilityLabel="View overall analysis"
                            accessibilityRole="button"
                            onPress={() => navigation.navigate("Analysis", { neighbors, result, receipt: receipt.toUpperCase() })}
                        >
                            <EmojiText size={18}>📊</EmojiText>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.analysisBtnTitle}>Overall Analysis</Text>
                                <Text style={styles.analysisBtnSub}>Charts, distribution & full cases list</Text>
                            </View>
                            <Text style={styles.analysisBtnArrow}>→</Text>
                        </TouchableOpacity>

                        {/* Tabs — background shift instead of border */}
                        <View style={styles.tabBarWrap}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.tabBar}>
                                    {tabs.map((tab) => (
                                        <TouchableOpacity
                                            key={tab.key}
                                            onPress={() => setActiveTab(tab.key)}
                                            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                                        >
                                            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                                                {tab.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Tab content — white card on surface bg */}
                        <View style={styles.tabContent}>

                            {/* Overview */}
                            {activeTab === "overview" && (
                                <View>
                                    <Text style={styles.cardLabel}>CASE BREAKDOWN</Text>
                                    <View style={styles.overviewGrid}>
                                        {[
                                            { label: "Receipt Number", value: receipt.toUpperCase(), mono: true },
                                            { label: "Form Type", value: `${result.form} — ${result.formDesc}` },
                                            { label: "Service Center", value: `${result.center} (${result.serviceCenter})` },
                                            { label: "Fiscal Year", value: `FY 20${result.parsed.year}` },
                                            { label: "Day of Year", value: `Day ${parseInt(result.parsed.day)}` },
                                            { label: "Sequential #", value: result.parsed.seq, mono: true },
                                            { label: "Status", value: result.status.label, color: result.status.color },
                                            { label: "Filed Date", value: result.filedDate },
                                            { label: "Last Updated", value: result.lastUpdated },
                                        ].map((item) => (
                                            <View key={item.label} style={styles.overviewItem}>
                                                <Text style={styles.overviewItemLabel}>{item.label}</Text>
                                                <Text style={[
                                                    styles.overviewItemValue,
                                                    { color: item.color || themeColors.text },
                                                    item.mono && { fontFamily: Fonts.mono, fontSize: 12 },
                                                ]}>
                                                    {item.value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Neighbors */}
                            {activeTab === "neighbors" && (
                                <View>
                                    <Text style={styles.cardLabel}>NEIGHBORING CASES — {neighbors.length} RESULTS</Text>
                                    <NeighborTable neighbors={neighbors} />
                                </View>
                            )}

                            {/* Timeline */}
                            {activeTab === "timeline" && (
                                <View>
                                    <Text style={styles.cardLabel}>CASE HISTORY</Text>
                                    <Timeline events={result.history} />
                                </View>
                            )}

                            {/* Tracked */}
                            {activeTab === "tracked" && (
                                <View>
                                    <Text style={styles.cardLabel}>TRACKED CASES ({trackedCases.length})</Text>
                                    {trackedCases.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <EmojiText size={40}>📌</EmojiText>
                                            <Text style={styles.emptyText}>No cases tracked yet</Text>
                                            <Text style={styles.emptySubText}>Search a case and tap "+ Track Case"</Text>
                                        </View>
                                    ) : (
                                        trackedCases.map((c, i) => (
                                            <View key={i} style={styles.trackedRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.trackedReceipt}>{c.receipt}</Text>
                                                    <Text style={styles.trackedMeta}>Added {c.addedAt} · {c.form}</Text>
                                                </View>
                                                <View style={styles.trackedRight}>
                                                    <StatusBadge status={c.status} />
                                                    <TouchableOpacity
                                                        onPress={() => setTrackedCases((prev) => prev.filter((_, j) => j !== i))}
                                                        style={styles.removeBtn}
                                                    >
                                                        <Text style={styles.removeBtnText}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* ── Empty State / Feature Cards ── */}
                {!result && !loading && (
                    <View>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.featuresGrid}>
                            {FEATURE_CARDS.map((f) => (
                                <View key={f.title} style={styles.featureCard}>
                                    <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                                        <EmojiText size={24}>{f.icon}</EmojiText>
                                    </View>
                                    <Text style={styles.featureTitle}>{f.title}</Text>
                                    <Text style={styles.featureDesc}>{f.desc}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Visa Bulletin banner */}
                        <TouchableOpacity
                            style={styles.visaBulletinBanner}
                            activeOpacity={0.85}
                            accessibilityLabel="View Visa Bulletin"
                            accessibilityRole="button"
                            onPress={() => navigation.navigate("VisaBulletin")}
                        >
                            <View style={styles.visaBulletinIconBox}>
                                <EmojiText size={22}>📅</EmojiText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.visaBulletinTitle}>Visa Bulletin</Text>
                                <Text style={styles.visaBulletinSub}>March 2026 · Priority dates & movements</Text>
                            </View>
                            <Text style={styles.visaBulletinArrow}>→</Text>
                        </TouchableOpacity>

                        {/* Service center guide */}
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>SERVICE CENTER CODES</Text>
                            <View style={styles.prefixGrid}>
                                {Object.entries(SERVICE_CENTERS).map(([code, center]) => (
                                    <View key={code} style={styles.prefixItem}>
                                        <View style={styles.prefixCodeBox}>
                                            <Text style={styles.prefixCode}>{code}</Text>
                                        </View>
                                        <Text style={styles.prefixCenter}>{center}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 48 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────
function makeStyles(Colors) {
    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.bg },
        scroll: { flex: 1 },
        // Asymmetric spacing — "magazine" layout per design spec
        scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8 },

        // Header
        header: {
            flexDirection: "row", alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16,
            backgroundColor: Colors.bg,
        },
        greeting: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },
        // Human-first: name is primary visual hook
        userName: { fontSize: 22, fontWeight: "800", color: Colors.text, fontFamily: Fonts.display },
        headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
        notifBtn: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: Colors.bgCard, alignItems: "center", justifyContent: "center",
            ...Shadow.card,
        },
        notifIcon: {},
        avatarBtn: {
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center",
            ...Shadow.card,
        },
        avatarBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", fontFamily: Fonts.displayBold },

        // Section
        section: { marginBottom: 24 },
        // Manrope for section titles — editorial edge
        sectionTitle: {
            fontSize: 20, fontWeight: "800", color: Colors.text,
            fontFamily: Fonts.display, marginBottom: 14,
        },

        // Search
        scanRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
        scanLabel: {
            fontSize: 11, color: Colors.textFaint,
            fontFamily: Fonts.sansSemiBold, fontWeight: "700",
            textTransform: "uppercase", letterSpacing: 0.8,
        },
        scanPills: { flexDirection: "row", gap: 8 },
        scanPill: {
            paddingHorizontal: 14, paddingVertical: 8,
            borderRadius: 9999, backgroundColor: Colors.bgCardAlt,
        },
        scanPillActive: { backgroundColor: Colors.accent },
        scanPillText: { fontSize: 13, fontFamily: Fonts.sansSemiBold, color: Colors.textMuted },
        scanPillTextActive: { color: "#fff" },

        // Error — tonal, no border
        errorBox: {
            marginTop: 10, backgroundColor: Colors.deniedBg,
            borderRadius: 10, padding: 12,
        },
        errorText: { fontSize: 13, color: Colors.denied, fontFamily: Fonts.sans },

        // Loading — tonal card
        loadingCard: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard, borderRadius: 16,
            padding: 40, alignItems: "center", gap: 14,
            marginBottom: 20,
        },
        loadingText: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: Fonts.sansSemiBold },
        loadingSubText: { fontSize: 12, color: Colors.textFaint, fontFamily: Fonts.sans },

        // Case card — white on surface bg, 4px left pill status indicator
        caseCard: {
            ...Shadow.cardStrong,
            backgroundColor: Colors.bgCard, borderRadius: 12,
            marginBottom: 18, overflow: "hidden",
            flexDirection: "row",
        },
        // Vertical 4px pill on left edge
        caseCardPill: { width: 4, borderRadius: 0 },
        caseCardBody: { flex: 1, padding: 20 },
        caseReceiptLabel: {
            fontSize: 10, color: Colors.textFaint, fontFamily: Fonts.sansBold,
            letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase",
        },
        caseReceipt: {
            fontSize: 22, fontWeight: "800", color: Colors.accent,
            fontFamily: Fonts.monoBold, letterSpacing: 1.5, marginBottom: 12,
        },

        // Meta pills — surface-container-low bg
        metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
        metaPill: {
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: Colors.bgCardAlt, borderRadius: 10,
            padding: 10, flex: 1, minWidth: "30%",
        },
        metaPillIcon: { fontSize: 18 },
        metaPillVal: { fontSize: 13, fontWeight: "700", color: Colors.text, fontFamily: Fonts.sansBold },
        metaPillSub: { fontSize: 10, color: Colors.textFaint, fontFamily: Fonts.sans },

        // Actions — ghost-border secondary buttons
        actionRow: { flexDirection: "row", gap: 10, marginTop: 18 },
        actionBtn: {
            borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
            backgroundColor: Colors.bgCardAlt,
        },
        actionBtnPrimary: { backgroundColor: Colors.accent },
        actionBtnPrimaryText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: Fonts.sansBold },
        actionBtnText: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.sansSemiBold },

        // Card — white on surface bg, no border (tonal layering)
        card: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 20, marginBottom: 18,
        },
        cardLabel: {
            fontSize: 11, fontWeight: "700", color: Colors.textFaint,
            fontFamily: Fonts.sansBold, letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 14,
        },

        // Analysis CTA button
        analysisBtn: {
            ...Shadow.card,
            backgroundColor: Colors.accent,
            borderRadius: 12, padding: 16,
            flexDirection: "row", alignItems: "center", gap: 14,
            marginBottom: 18,
        },
        analysisBtnTitle: {
            fontSize: 15, fontWeight: "700", color: "#fff",
            fontFamily: Fonts.sansBold, marginBottom: 2,
        },
        analysisBtnSub: {
            fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: Fonts.sans,
        },
        analysisBtnArrow: {
            fontSize: 20, color: "#fff", fontFamily: Fonts.sansBold,
        },

        // Tabs — background shift for active state, no border lines
        tabBarWrap: {
            backgroundColor: Colors.bgCardAlt,
            borderRadius: 12, marginBottom: 4,
            overflow: "hidden",
        },
        tabBar: {
            flexDirection: "row", paddingHorizontal: 4, paddingVertical: 4,
        },
        tab: {
            paddingHorizontal: 16, paddingVertical: 10,
            borderRadius: 10,
        },
        tabActive: { backgroundColor: Colors.bgCard, ...Shadow.card },
        tabText: { fontSize: 13, fontFamily: Fonts.sansSemiBold, color: Colors.textFaint },
        tabTextActive: { color: Colors.accent, fontWeight: "700" },

        // Tab content
        tabContent: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 20, marginBottom: 24, minHeight: 200,
            marginTop: 4,
        },

        // Overview grid — surface-container-low items
        overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
        overviewItem: {
            backgroundColor: Colors.bgCardAlt, borderRadius: 12,
            padding: 14, minWidth: "45%", flex: 1,
        },
        overviewItemLabel: {
            fontSize: 10, color: Colors.textFaint, textTransform: "uppercase",
            letterSpacing: 0.8, fontFamily: Fonts.sansBold, marginBottom: 6,
        },
        overviewItemValue: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: Fonts.sansSemiBold },

        // Tracked rows
        trackedRow: {
            flexDirection: "row", alignItems: "center",
            backgroundColor: Colors.bgCardAlt, borderRadius: 12,
            padding: 14, marginBottom: 10, gap: 12,
        },
        trackedReceipt: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.accent, marginBottom: 4 },
        trackedMeta: { fontSize: 11, color: Colors.textFaint, fontFamily: Fonts.sans },
        trackedRight: { alignItems: "flex-end", gap: 8 },
        removeBtn: {
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: Colors.deniedBg, alignItems: "center", justifyContent: "center",
        },
        removeBtnText: { color: Colors.denied, fontSize: 12, fontWeight: "700" },

        // Empty state
        emptyState: { alignItems: "center", paddingVertical: 48 },
        emptyIcon: { fontSize: 40, marginBottom: 14 },
        emptyText: { fontSize: 16, fontWeight: "700", color: Colors.textSub, fontFamily: Fonts.displayBold },
        emptySubText: { fontSize: 13, color: Colors.textFaint, marginTop: 6, fontFamily: Fonts.sans },

        // Feature cards — white on surface bg
        featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
        featureCard: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 18, minWidth: "45%", flex: 1,
        },
        featureIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
        featureIconText: { fontSize: 24 },
        featureTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, fontFamily: Fonts.displayBold, marginBottom: 6 },
        featureDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, fontFamily: Fonts.sans },

        // Visa Bulletin banner
        visaBulletinBanner: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard, borderRadius: 12,
            flexDirection: "row", alignItems: "center", gap: 14,
            padding: 16, marginBottom: 20,
        },
        visaBulletinIconBox: {
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: Colors.accentLight,
            alignItems: "center", justifyContent: "center",
        },
        visaBulletinTitle: {
            fontSize: 15, fontWeight: "700", color: Colors.text,
            fontFamily: Fonts.sansBold, marginBottom: 2,
        },
        visaBulletinSub: {
            fontSize: 12, color: Colors.textFaint, fontFamily: Fonts.sans,
        },
        visaBulletinArrow: {
            fontSize: 20, color: Colors.accent, fontFamily: Fonts.sansBold,
        },

        // Prefix guide
        prefixGrid: { gap: 8 },
        prefixItem: {
            flexDirection: "row", alignItems: "center", gap: 14,
            backgroundColor: Colors.bgCardAlt, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 12,
        },
        prefixCodeBox: {
            backgroundColor: Colors.accentLight, borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 4,
        },
        prefixCode: { color: Colors.accent, fontWeight: "800", fontSize: 13, fontFamily: Fonts.monoBold },
        prefixCenter: { fontSize: 13, color: Colors.textSub, fontFamily: Fonts.sans, flex: 1 },
    });
}
