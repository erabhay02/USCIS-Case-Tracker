import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import { Fonts, Shadow } from "../theme";
import EmojiText from "../components/EmojiText";

// ── Static Bulletin Data ─────────────────────────────────────────────────────
const BULLETIN_MONTH = "March 2026";

/** Create a date cell. delta = null means no movement ("-") */
function d(date, delta = null) { return { date, delta }; }
const C = "C"; // Current — no backlog

const EB_COLS = ["EB-1", "EB-2", "EB-3", "EB-4", "EB-5"];
const FS_COLS = ["F1", "F2A", "F2B", "F3", "F4"];
const COUNTRIES = ["All Others", "China", "India", "Mexico", "Philippines"];

const BULLETIN_DATA = {
    final: {
        eb: {
            "All Others":  [C, C, d("May 31, 2024", "+244d"), d("Jul 14, 2022", "+365d"), C],
            "China":       [d("Mar 31, 2023", "+31d"), d("Aug 31, 2021"), d("Jun 14, 2021", "+45d"), d("Jul 14, 2022", "+365d"), d("Aug 31, 2016", "+17d")],
            "India":       [d("Mar 31, 2023", "+31d"), d("Jul 14, 2014", "+303d"), d("Nov 14, 2013"), d("Jul 14, 2022", "+365d"), d("Apr 30, 2022")],
            "Mexico":      [C, C, d("May 31, 2024", "+244d"), d("Jul 14, 2022", "+365d"), C],
            "Philippines": [C, C, d("Jul 31, 2023"), d("Jul 14, 2022", "+365d"), C],
        },
        fs: {
            "All Others":  [d("Apr 30, 2017", "+174d"), d("Jan 31, 2024"), d("May 21, 2017", "+172d"), d("Dec 21, 2011", "+105d"), d("Jun 7, 2008", "+152d")],
            "China":       [d("Apr 30, 2017", "+174d"), d("Jan 31, 2024"), d("May 21, 2017", "+172d"), d("Dec 21, 2011", "+105d"), d("Jun 7, 2008", "+152d")],
            "India":       [d("Apr 30, 2017", "+174d"), d("Jan 31, 2024"), d("May 21, 2017", "+172d"), d("Dec 21, 2011", "+105d"), d("Oct 31, 2006")],
            "Mexico":      [d("Feb 14, 2007", "+55d"), d("Jan 31, 2023"), d("Feb 14, 2009"), d("Apr 30, 2001"), d("Apr 7, 2001")],
            "Philippines": [d("Apr 30, 2013", "+61d"), d("Jan 31, 2024"), d("Apr 7, 2013", "+107d"), d("Jun 30, 2005", "+122d"), d("Jan 31, 2007", "+153d")],
        },
    },
    filing: {
        eb: {
            "All Others":  [C, C, C, C, C],
            "China":       [d("Jun 1, 2023", "+31d"), d("Oct 1, 2022", "+30d"), d("Aug 1, 2021", "+30d"), C, d("Sep 1, 2017", "+31d")],
            "India":       [d("Jun 1, 2023", "+31d"), d("Jan 1, 2015", "+92d"), d("Feb 1, 2014", "+31d"), C, d("Apr 30, 2022")],
            "Mexico":      [C, C, C, C, C],
            "Philippines": [C, C, d("Nov 1, 2023", "+31d"), C, C],
        },
        fs: {
            "All Others":  [d("Aug 22, 2017", "+92d"), C, d("Sep 22, 2017", "+60d"), d("Apr 1, 2012", "+60d"), d("Oct 22, 2008", "+92d")],
            "China":       [d("Aug 22, 2017", "+92d"), C, d("Sep 22, 2017", "+60d"), d("Apr 1, 2012", "+60d"), d("Oct 22, 2008", "+92d")],
            "India":       [d("Aug 22, 2017", "+92d"), C, d("Sep 22, 2017", "+60d"), d("Apr 1, 2012", "+60d"), d("Feb 1, 2007", "+31d")],
            "Mexico":      [d("May 1, 2007", "+60d"), C, d("May 1, 2009", "+31d"), d("Jul 22, 2001", "+30d"), d("Jun 22, 2001", "+30d")],
            "Philippines": [d("Aug 22, 2013", "+60d"), C, d("Aug 22, 2013", "+61d"), d("Oct 1, 2005", "+92d"), d("May 22, 2007", "+92d")],
        },
    },
};

// ── Responsive layout constants ───────────────────────────────────────────────
const SCREEN_H_PADDING = 36;   // 18px × 2 sides
const MIN_COUNTRY_W = 100;
const MIN_COL_W = 92;
const COUNTRY_RATIO = 0.26;    // country col = 26% of available width
const ROW_H = 66;
const HEADER_H = 44;

/**
 * Calculate column widths given the available pixel width and number of data cols.
 * When screen is wide enough (landscape / tablet) the columns expand to fill the
 * full width — no horizontal scroll required.  On narrow screens the minimum
 * widths are enforced and the horizontal ScrollView scrolls naturally.
 */
function calcWidths(availableWidth, numCols) {
    const countryW = Math.max(MIN_COUNTRY_W, availableWidth * COUNTRY_RATIO);
    const remaining = availableWidth - countryW;
    const colW = Math.max(MIN_COL_W, remaining / numCols);
    return { countryW, colW };
}

// ── Reusable table component ─────────────────────────────────────────────────
function BulletinTable({ columns, tableData, countryW, colW, Colors, styles }) {
    return (
        <View style={{ flexDirection: "row" }}>
            {/* Fixed country column (sticky left) */}
            <View style={{ width: countryW }}>
                <View style={[styles.tableHeaderCell, { width: countryW, height: HEADER_H }]}>
                    <Text style={styles.tableHeaderText}>Country</Text>
                </View>
                {COUNTRIES.map((country, i) => (
                    <View
                        key={country}
                        style={[
                            styles.countryCell,
                            { width: countryW, height: ROW_H },
                            i % 2 === 1 && { backgroundColor: Colors.bgCardAlt },
                        ]}
                    >
                        <Text style={styles.countryText} numberOfLines={1}>{country}</Text>
                    </View>
                ))}
            </View>

            {/* Horizontally scrollable (or static when wide enough) category columns */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                scrollEnabled={colW === MIN_COL_W}
            >
                <View>
                    {/* Header row */}
                    <View style={{ flexDirection: "row", height: HEADER_H }}>
                        {columns.map((col) => (
                            <View key={col} style={[styles.tableHeaderCell, { width: colW }]}>
                                <Text style={styles.tableHeaderText}>{col}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Data rows */}
                    {COUNTRIES.map((country, rowIdx) => (
                        <View key={country} style={{ flexDirection: "row" }}>
                            {(tableData[country] || []).map((cell, colIdx) => {
                                const hasMovement = cell !== C && cell?.delta != null;
                                const isAlt = rowIdx % 2 === 1;
                                return (
                                    <View
                                        key={colIdx}
                                        style={[
                                            styles.dataCell,
                                            { width: colW, height: ROW_H },
                                            isAlt && !hasMovement && { backgroundColor: Colors.bgCardAlt },
                                            hasMovement && styles.dataCellGreen,
                                        ]}
                                    >
                                        {cell === C ? (
                                            <Text style={styles.cellCurrent}>C</Text>
                                        ) : (
                                            <View style={{ alignItems: "center" }}>
                                                <Text
                                                    style={[
                                                        styles.cellDate,
                                                        hasMovement && { color: "#166534" },
                                                    ]}
                                                    numberOfLines={1}
                                                    adjustsFontSizeToFit
                                                    minimumFontScale={0.8}
                                                >
                                                    {cell.date}
                                                </Text>
                                                <Text style={hasMovement ? styles.cellDelta : styles.cellNoMove}>
                                                    {cell.delta || "-"}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function VisaBulletinScreen({ navigation }) {
    const { Colors, isDark } = useTheme();
    const [chartType, setChartType] = useState("final"); // "final" | "filing"
    const styles = useMemo(() => makeStyles(Colors), [Colors]);
    const data = BULLETIN_DATA[chartType];

    // Recompute column widths whenever the window dimensions change (rotation, split-view, etc.)
    const { width } = useWindowDimensions();
    const availableWidth = width - SCREEN_H_PADDING;
    const ebWidths = useMemo(() => calcWidths(availableWidth, EB_COLS.length), [availableWidth]);
    const fsWidths = useMemo(() => calcWidths(availableWidth, FS_COLS.length), [availableWidth]);

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                        <Text style={styles.headerTitle}>Visa Bulletin</Text>
                        <Text style={styles.headerMonth}>{BULLETIN_MONTH}</Text>
                    </View>
                    <Text style={styles.headerSub}>Priority date movements & wait times</Text>
                </View>
            </View>

            {/* Final Action Dates / Dates for Filing toggle */}
            <View style={styles.toggleRow}>
                {[
                    { key: "final", label: "Final Action Dates" },
                    { key: "filing", label: "Dates for Filing" },
                ].map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.toggleBtn, chartType === key && styles.toggleBtnActive]}
                        onPress={() => setChartType(key)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, chartType === key && styles.toggleTextActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Track priority date movements, compare categories, and estimate your wait time.
                </Text>

                {/* ── Employment-Based Table ── */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: "#e8f0fb" }]}>
                            <EmojiText size={15}>💼</EmojiText>
                        </View>
                        <Text style={styles.sectionTitle}>Employment-Based</Text>
                    </View>
                    <BulletinTable
                        columns={EB_COLS}
                        tableData={data.eb}
                        countryW={ebWidths.countryW}
                        colW={ebWidths.colW}
                        Colors={Colors}
                        styles={styles}
                    />
                </View>

                {/* ── Family-Sponsored Table ── */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: "#fce8fb" }]}>
                            <EmojiText size={15}>👨‍👩‍👧</EmojiText>
                        </View>
                        <Text style={styles.sectionTitle}>Family-Sponsored</Text>
                    </View>
                    <BulletinTable
                        columns={FS_COLS}
                        tableData={data.fs}
                        countryW={fsWidths.countryW}
                        colW={fsWidths.colW}
                        Colors={Colors}
                        styles={styles}
                    />
                </View>

                {/* ── Legend ── */}
                <View style={styles.legendCard}>
                    <Text style={styles.legendTitle}>LEGEND</Text>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: "#16a34a" }]} />
                        <Text style={styles.legendText}><Text style={{ fontWeight: "700" }}>C</Text> = Current (no backlog, file immediately)</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: "#d4e3fe" }]} />
                        <Text style={styles.legendText}><Text style={{ fontWeight: "700" }}>+Nd</Text> = Priority date advanced by N days from prior month</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.bgHighest }]} />
                        <Text style={styles.legendText}><Text style={{ fontWeight: "700" }}>-</Text> = No movement from prior month</Text>
                    </View>
                </View>

                {/* ── USCIS Filing Chart Notice ── */}
                <View style={styles.noticeCard}>
                    <Text style={styles.noticeTitle}>USCIS Filing Chart Notice</Text>
                    {[
                        {
                            label: "For Family-Sponsored Filings",
                            text: "For all family-sponsored preference categories, you must use the Dates for Filing chart in the Department of State Visa Bulletin.",
                        },
                        {
                            label: "For Employment-Based Preference Filings",
                            text: "For all employment-based preference categories, you must use the Dates for Filing chart in the Department of State Visa Bulletin.",
                        },
                    ].map((notice, i) => (
                        <View key={i} style={[styles.noticeItem, i === 0 && { marginBottom: 10 }]}>
                            <View style={styles.noticeInfoIcon}>
                                <Text style={{ fontSize: 11, color: Colors.accent, fontWeight: "700", fontFamily: Fonts.sansBold }}>i</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.noticeItemTitle}>{notice.label}</Text>
                                <Text style={styles.noticeItemText}>{notice.text}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function makeStyles(Colors) {
    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.bg },

        // Header
        header: {
            flexDirection: "row", alignItems: "center", gap: 14,
            paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14,
            backgroundColor: Colors.bg,
        },
        backBtn: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: Colors.bgCard,
            alignItems: "center", justifyContent: "center",
            ...Shadow.card,
        },
        backArrow: { fontSize: 18, color: Colors.text },
        headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.text, fontFamily: Fonts.display },
        headerMonth: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.sans },
        headerSub: { fontSize: 12, color: Colors.textFaint, fontFamily: Fonts.sans, marginTop: 2 },

        // Toggle
        toggleRow: {
            flexDirection: "row", gap: 8,
            paddingHorizontal: 18, paddingBottom: 14,
        },
        toggleBtn: {
            flex: 1, paddingVertical: 11, borderRadius: 10,
            backgroundColor: Colors.bgCardAlt, alignItems: "center",
        },
        toggleBtnActive: { backgroundColor: Colors.accent },
        toggleText: { fontSize: 13, fontFamily: Fonts.sansSemiBold, color: Colors.textMuted },
        toggleTextActive: { color: "#fff", fontWeight: "700", fontFamily: Fonts.sansBold },

        scroll: { paddingHorizontal: 18, paddingTop: 4 },

        description: {
            fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans,
            marginBottom: 18, lineHeight: 20,
        },

        // Section card
        card: {
            backgroundColor: Colors.bgCard, borderRadius: 12,
            marginBottom: 18, overflow: "hidden",
            ...Shadow.card,
        },
        sectionHeader: {
            flexDirection: "row", alignItems: "center", gap: 10,
            paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
        },
        sectionIconBox: {
            width: 30, height: 30, borderRadius: 8,
            alignItems: "center", justifyContent: "center",
        },
        sectionTitle: {
            fontSize: 17, fontWeight: "700", color: Colors.text, fontFamily: Fonts.displayBold,
        },

        // Table cells
        tableHeaderCell: {
            backgroundColor: Colors.bgSection,
            alignItems: "center", justifyContent: "center",
            paddingHorizontal: 8,
        },
        tableHeaderText: {
            fontSize: 10, fontWeight: "700", color: Colors.textFaint,
            fontFamily: Fonts.sansBold, textTransform: "uppercase", letterSpacing: 0.6,
        },
        countryCell: {
            justifyContent: "center", paddingLeft: 14,
            backgroundColor: Colors.bgCard,
        },
        countryText: {
            fontSize: 13, color: Colors.text, fontFamily: Fonts.sansSemiBold, fontWeight: "600",
        },
        dataCell: {
            alignItems: "center", justifyContent: "center",
            backgroundColor: Colors.bgCard, paddingHorizontal: 4,
        },
        dataCellGreen: {
            backgroundColor: "#f0fdf4",
        },
        cellCurrent: {
            fontSize: 16, fontWeight: "700", color: Colors.textMuted, fontFamily: Fonts.sansBold,
        },
        cellDate: {
            fontSize: 11, color: Colors.text, fontFamily: Fonts.sansSemiBold,
            fontWeight: "600", textAlign: "center",
        },
        cellDelta: {
            fontSize: 11, color: "#16a34a", fontFamily: Fonts.sansBold,
            fontWeight: "700", marginTop: 3,
        },
        cellNoMove: {
            fontSize: 12, color: Colors.textFaint, fontFamily: Fonts.sans, marginTop: 3,
        },

        // Legend
        legendCard: {
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 16, marginBottom: 18,
            ...Shadow.card,
        },
        legendTitle: {
            fontSize: 10, fontWeight: "700", color: Colors.textFaint,
            fontFamily: Fonts.sansBold, letterSpacing: 1.2,
            textTransform: "uppercase", marginBottom: 12,
        },
        legendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
        legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
        legendText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans, flex: 1, lineHeight: 18 },

        // Notice
        noticeCard: {
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 20, marginBottom: 18,
            ...Shadow.card,
        },
        noticeTitle: {
            fontSize: 16, fontWeight: "700", color: Colors.text,
            fontFamily: Fonts.displayBold, marginBottom: 14,
        },
        noticeItem: {
            flexDirection: "row", gap: 12, alignItems: "flex-start",
            backgroundColor: Colors.bgCardAlt, borderRadius: 10,
            padding: 14,
        },
        noticeInfoIcon: {
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: Colors.accentLight,
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: 1,
        },
        noticeItemTitle: {
            fontSize: 13, fontWeight: "700", color: Colors.text,
            fontFamily: Fonts.sansBold, marginBottom: 4,
        },
        noticeItemText: {
            fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans, lineHeight: 18,
        },
    });
}
