import React, { useMemo, useState, useCallback } from "react";
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
import { STATUSES } from "../utils/uscisHelpers";
import StatusBadge from "../components/StatusBadge";
import DonutChart from "../components/DonutChart";
import EmojiText from "../components/EmojiText";

// ── Status segment config (donut chart order) ───────────────────────────────
const SEGMENT_KEYS = [
    "approved", "processing", "rfe_issued", "rfe_received",
    "received", "transferred", "denied", "interview",
];

// ── Individual-case range chart ───────────────────────────────────────────────
const RC_H     = 68;  // regular bar height
const RC_H_YOU = 88;  // your case bar height
const RC_GAP   = 3;   // gap between bars

function RangeChart({ neighbors, Colors, chartWidth }) {
    if (!neighbors || neighbors.length === 0 || !chartWidth) return null;
    const sorted = [...neighbors].sort((a, b) => a.offset - b.offset);
    const n = sorted.length;
    // Fill full width: barW fills chartWidth accounting for gaps
    const barW = Math.max(6, (chartWidth - RC_GAP * (n - 1)) / n);
    const totalH = RC_H_YOU + 22;

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: RC_GAP, height: totalH, width: chartWidth }}>
            {sorted.map((item, i) => {
                const isCurrent = item.isCurrent;
                const barH = isCurrent ? RC_H_YOU : RC_H;
                const label = isCurrent ? "You"
                    : item.offset > 0 ? `+${item.offset}` : `${item.offset}`;
                const showLabel = isCurrent || item.offset % 5 === 0;
                return (
                    <View
                        key={i}
                        style={{ width: barW, height: totalH, alignItems: "center", justifyContent: "flex-end" }}
                    >
                        <View
                            style={{
                                width: barW, height: barH, borderRadius: 4,
                                backgroundColor: item.status.color,
                                opacity: isCurrent ? 1 : 0.82,
                                ...(isCurrent && { borderWidth: 2, borderColor: Colors.accent }),
                            }}
                        />
                        <Text
                            style={{
                                marginTop: 4,
                                fontSize: isCurrent ? 9 : 7,
                                color: isCurrent ? Colors.accent : Colors.textFaint,
                                fontFamily: isCurrent ? Fonts.sansBold : Fonts.sans,
                                textAlign: "center",
                                opacity: showLabel ? 1 : 0,
                            }}
                        >
                            {label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

// ── USCIS chart statuses ─────────────────────────────────────────────────────
const CHART_STATUSES = [
    { key: "approved",   label: "Approved",   color: "#16a34a" },
    { key: "denied",     label: "Denied",     color: "#dc2626" },
    { key: "received",   label: "Received",   color: "#06b6d4" },
    { key: "rfe",        label: "RFE",        color: "#f97316" },
    { key: "noi",        label: "NOI",        color: "#be123c" },
    { key: "withdrawal", label: "Withdrawal", color: "#78350f" },
    { key: "terminated", label: "Terminated", color: "#4b5563" },
    { key: "processing", label: "Processing", color: "#3b82f6" },
    { key: "others",     label: "Others",     color: "#9ca3af" },
];
// Reversed so "Approved" renders as the bottom segment in flex-column bars
const CHART_STATUSES_REV = [...CHART_STATUSES].reverse();

// ── Mock data — "Where Is USCIS Now?" (filing dates) ─────────────────────────
const WORKING_DATA = [
    { date: "08/18/21", counts: { approved: 83, denied: 3, received: 5, rfe: 2, processing: 4, others: 3 } },
    { date: "08/20/21", counts: { approved: 87, denied: 2, received: 4, rfe: 2, processing: 3, others: 2 } },
    { date: "08/23/21", counts: { approved: 88, denied: 3, received: 3, rfe: 1, processing: 3, others: 2 } },
    { date: "08/25/21", counts: { approved: 85, denied: 2, received: 5, rfe: 1, processing: 5, others: 2 } },
    { date: "08/26/21", counts: { approved: 71, denied: 4, received: 6, rfe: 3, processing: 10, terminated: 4, others: 2 } },
    { date: "08/27/21", counts: { approved: 70, denied: 3, received: 7, rfe: 2, processing: 12, others: 6 } },
    { date: "09/01/21", counts: { approved: 88, denied: 2, received: 4, rfe: 2, processing: 3, others: 1 } },
    { date: "09/02/21", counts: { approved: 65, denied: 5, received: 6, rfe: 3, noi: 2, processing: 14, others: 5 } },
    { date: "09/07/21", counts: { approved: 90, denied: 2, received: 3, rfe: 2, processing: 2, others: 1 } },
    { date: "09/08/21", counts: { approved: 87, denied: 3, received: 4, rfe: 2, processing: 3, others: 1 } },
    { date: "10/22/22", counts: { approved: 88, denied: 2, received: 4, rfe: 2, processing: 3, others: 1 } },
    { date: "12/23/22", counts: { approved: 86, denied: 3, received: 4, rfe: 2, processing: 3, others: 2 } },
    { date: "12/29/22", counts: { approved: 80, denied: 2, received: 4, rfe: 2, processing: 8, others: 4 } },
    { date: "12/30/22", counts: { approved: 55, denied: 3, received: 5, rfe: 2, noi: 1, processing: 30, others: 4 } },
    { date: "01/03/23", counts: { approved: 91, denied: 2, received: 3, rfe: 1, processing: 2, others: 1 } },
    { date: "01/04/23", counts: { approved: 82, denied: 3, received: 4, rfe: 2, processing: 6, others: 3 } },
    { date: "01/10/23", counts: { approved: 80, denied: 3, received: 5, rfe: 2, processing: 7, others: 3 } },
    { date: "08/25/23", counts: { approved: 89, denied: 2, received: 3, rfe: 2, processing: 3, others: 1 } },
    { date: "09/14/23", counts: { approved: 91, denied: 2, received: 3, rfe: 1, processing: 2, others: 1 } },
    { date: "09/19/23", counts: { approved: 89, denied: 2, received: 3, rfe: 2, processing: 3, others: 1 } },
];

// ── Mock data — "How Busy Is USCIS?" (processing dates) ──────────────────────
const BUSY_DATA = [
    { date: "02/28", counts: { approved: 300,  processing: 500,  received: 150, denied: 60,  rfe: 40,  others: 20 } },
    { date: "03/08", counts: { approved: 1100, processing: 2200, received: 700, denied: 200, rfe: 120, withdrawal: 30, others: 50 } },
    { date: "03/09", counts: { approved: 1000, processing: 2800, received: 600, denied: 180, rfe: 100, others: 40 } },
    { date: "03/10", counts: { approved: 1100, processing: 2500, received: 650, denied: 190, rfe: 110, others: 45 } },
    { date: "03/11", counts: { approved: 1000, processing: 2600, received: 700, denied: 180, rfe: 100, withdrawal: 20, others: 40 } },
    { date: "03/12", counts: { approved: 1000, processing: 2500, received: 680, denied: 175, rfe: 95,  others: 45 } },
    { date: "03/13", counts: { approved: 1100, processing: 3000, received: 750, denied: 200, rfe: 110, others: 50 } },
    { date: "03/14", counts: { approved: 200,  processing: 100,  received: 80,  denied: 40,  rfe: 20,  others: 10 } },
    { date: "03/15", counts: { approved: 50,   processing: 40,   received: 20,  denied: 10,  rfe: 5,   others: 5  } },
    { date: "03/16", counts: { approved: 1200, processing: 2200, received: 600, denied: 190, rfe: 100, others: 40 } },
    { date: "03/17", counts: { approved: 800,  processing: 1500, received: 500, denied: 150, rfe: 80,  others: 30 } },
    { date: "03/18", counts: { approved: 1000, processing: 2200, received: 700, denied: 180, rfe: 100, withdrawal: 25, others: 45 } },
    { date: "03/19", counts: { approved: 1100, processing: 2800, received: 750, denied: 200, rfe: 110, others: 50 } },
    { date: "03/20", counts: { approved: 1500, processing: 3500, received: 800, denied: 240, rfe: 130, withdrawal: 30, others: 60 } },
    { date: "03/21", counts: { approved: 300,  processing: 200,  received: 100, denied: 50,  rfe: 25,  others: 15 } },
    { date: "03/23", counts: { approved: 700,  processing: 2200, received: 500, denied: 150, rfe: 80,  others: 35 } },
    { date: "03/24", counts: { approved: 650,  processing: 1800, received: 480, denied: 140, rfe: 75,  others: 30 } },
    { date: "03/25", counts: { approved: 700,  processing: 1900, received: 500, denied: 145, rfe: 78,  others: 32 } },
    { date: "03/26", counts: { approved: 680,  processing: 2000, received: 510, denied: 148, rfe: 79,  withdrawal: 18, others: 33 } },
    { date: "03/27", counts: { approved: 720,  processing: 3500, received: 520, denied: 155, rfe: 82,  others: 35 } },
    { date: "03/28", counts: { approved: 600,  processing: 700,  received: 300, denied: 100, rfe: 50,  others: 22 } },
    { date: "03/30", counts: { approved: 500,  processing: 1800, received: 450, denied: 130, rfe: 70,  others: 28 } },
    { date: "03/31", counts: { approved: 550,  processing: 2100, received: 480, denied: 135, rfe: 72,  others: 30 } },
    { date: "04/01", counts: { approved: 900,  processing: 2500, received: 600, denied: 170, rfe: 90,  withdrawal: 22, others: 38 } },
    { date: "04/02", counts: { approved: 850,  processing: 1800, received: 550, denied: 160, rfe: 85,  others: 35 } },
    { date: "04/03", counts: { approved: 800,  processing: 1700, received: 520, denied: 155, rfe: 82,  others: 33 } },
    { date: "04/04", counts: { approved: 280,  processing: 200,  received: 100, denied: 45,  rfe: 22,  others: 10 } },
    { date: "04/06", counts: { approved: 100,  processing: 80,   received: 40,  denied: 15,  rfe: 8,   others: 4  } },
    { date: "04/07", counts: { approved: 100,  processing: 50,   received: 30,  denied: 10,  rfe: 5,   others: 3  } },
];

// ── Y-axis tick helper ────────────────────────────────────────────────────────
function niceYTicks(maxVal, tickCount = 5) {
    if (!maxVal) return [{ fraction: 0, label: "0", niceMax: 1 }];
    const rawStep = maxVal / (tickCount - 1);
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep = Math.ceil(rawStep / mag) * mag;
    const niceMax = niceStep * (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => {
        const val = niceStep * i;
        return {
            fraction: val / niceMax,
            label: val >= 1000 ? `${val / 1000}k` : `${val}`,
            niceMax,
        };
    }).reverse(); // high → low (top → bottom of chart)
}

// ── Chart layout constants ────────────────────────────────────────────────────
const C_BAR_G  = 4;
const C_H      = 190;
const C_Y_W    = 36;
const C_X_H    = 54;

// ── Filter chip (display only) ────────────────────────────────────────────────
function FilterChip({ label, Colors }) {
    return (
        <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: Colors.accentLight, borderRadius: 9999,
            paddingHorizontal: 12, paddingVertical: 6,
        }}>
            <Text style={{ fontSize: 12, color: Colors.accent, fontFamily: Fonts.sansSemiBold, fontWeight: "600" }}>
                {label}
            </Text>
            <Text style={{ fontSize: 10, color: Colors.accent }}>▾</Text>
        </View>
    );
}

// ── USCIS stacked bar chart ───────────────────────────────────────────────────
function USCISBarChart({ data, normalize, Colors, chartWidth }) {
    const totals = useMemo(
        () => data.map((d) => CHART_STATUSES.reduce((s, st) => s + (d.counts[st.key] || 0), 0)),
        [data],
    );
    const globalMax = useMemo(() => Math.max(...totals, 1), [totals]);

    const yTicks = useMemo(
        () => normalize
            ? [
                { fraction: 1.0, label: "100%" },
                { fraction: 0.75, label: "75%"  },
                { fraction: 0.5,  label: "50%"  },
                { fraction: 0.25, label: "25%"  },
                { fraction: 0,    label: "0%"   },
            ]
            : niceYTicks(globalMax),
        [normalize, globalMax],
    );

    const scaledMax = normalize ? 1 : (yTicks[0]?.niceMax || globalMax);

    // Compute bar width to fill the available chart area
    const barsAreaW = chartWidth ? chartWidth - C_Y_W : 0;
    const barW = barsAreaW > 0
        ? Math.max(4, (barsAreaW - C_BAR_G * (data.length - 1)) / data.length)
        : 10;

    if (!chartWidth) return null;

    return (
        <View style={{ flexDirection: "row" }}>
            {/* Y-axis labels — fixed width */}
            <View style={{ width: C_Y_W, height: C_H + C_X_H }}>
                {yTicks.map((tick) => (
                    <Text
                        key={tick.label}
                        style={{
                            position: "absolute",
                            top: (1 - tick.fraction) * C_H - 7,
                            right: 4,
                            fontSize: 9,
                            color: Colors.textFaint,
                            fontFamily: Fonts.sans,
                            textAlign: "right",
                        }}
                    >
                        {tick.label}
                    </Text>
                ))}
            </View>

            {/* Bars + x-axis — fills remaining width, no scroll */}
            <View style={{ width: barsAreaW }}>
                {/* Chart area */}
                <View style={{ height: C_H }}>
                    {/* Grid lines */}
                    {yTicks.map((tick) => (
                        <View
                            key={tick.label}
                            style={{
                                position: "absolute",
                                top: (1 - tick.fraction) * C_H,
                                left: 0, right: 0,
                                height: StyleSheet.hairlineWidth,
                                backgroundColor: Colors.bgSection,
                            }}
                        />
                    ))}

                    {/* Bars bottom-aligned */}
                    <View style={{ flexDirection: "row", alignItems: "flex-end", height: C_H }}>
                        {data.map((d, i) => {
                            const total = totals[i];
                            if (!total) return <View key={i} style={{ width: barW, marginRight: C_BAR_G }} />;
                            const barH = normalize ? C_H : (total / scaledMax) * C_H;
                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: barW, height: barH,
                                        marginRight: i < data.length - 1 ? C_BAR_G : 0,
                                        overflow: "hidden", borderRadius: 2,
                                    }}
                                >
                                    {CHART_STATUSES_REV.map((st) => {
                                        const count = d.counts[st.key] || 0;
                                        if (!count) return null;
                                        return (
                                            <View
                                                key={st.key}
                                                style={{
                                                    width: "100%",
                                                    height: `${(count / total) * 100}%`,
                                                    backgroundColor: st.color,
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* X-axis date labels — rotated –45° */}
                <View style={{ flexDirection: "row", height: C_X_H }}>
                    {data.map((d, i) => (
                        <View
                            key={i}
                            style={{ width: barW + (i < data.length - 1 ? C_BAR_G : 0), height: C_X_H, overflow: "visible" }}
                        >
                            <Text
                                style={{
                                    position: "absolute",
                                    top: 8, left: -14, width: 46,
                                    fontSize: 7,
                                    color: Colors.textFaint,
                                    fontFamily: Fonts.sans,
                                    textAlign: "right",
                                    transform: [{ rotate: "-45deg" }],
                                }}
                            >
                                {d.date}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AnalysisScreen({ navigation, route }) {
    const { neighbors = [], result, receipt } = route.params || {};
    const { Colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);
    const [normalizeWorking, setNormalizeWorking] = useState(true);
    const [rangeChartW, setRangeChartW] = useState(0);
    const [uscisChartW, setUscisChartW] = useState(0);
    const onRangeLayout = useCallback((e) => setRangeChartW(e.nativeEvent.layout.width), []);
    const onUscisLayout = useCallback((e) => setUscisChartW(e.nativeEvent.layout.width), []);

    // ── Derived data ─────────────────────────────────────────────────────────
    const statusSegments = useMemo(() => {
        return SEGMENT_KEYS
            .map((key) => {
                const status = STATUSES.find((s) => s.key === key);
                const count = neighbors.filter((n) => n.status.key === key).length;
                return { key, label: status?.label || key, color: status?.color || "#ccc", count };
            })
            .filter((s) => s.count > 0);
    }, [neighbors]);

    const total = neighbors.length;
    const approvedCount = neighbors.filter((n) => n.status.key === "approved").length;
    const pendingCount = neighbors.filter((n) =>
        ["received", "processing", "rfe_issued", "rfe_received"].includes(n.status.key)
    ).length;
    const deniedCount = neighbors.filter((n) => n.status.key === "denied").length;

    const approvalRate = total ? Math.round((approvedCount / total) * 100) : 0;
    const pendingRate = total ? Math.round((pendingCount / total) * 100) : 0;
    const deniedRate = total ? Math.round((deniedCount / total) * 100) : 0;

    const sortedNeighbors = useMemo(
        () => [...neighbors].sort((a, b) => a.offset - b.offset),
        [neighbors]
    );

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
                    <Text style={styles.headerTitle}>Overall Analysis</Text>
                    <Text style={styles.headerSub}>{receipt?.toUpperCase() || "—"}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Stats Row */}
                <View style={styles.statsRow}>
                    {[
                        { label: "CASES SCANNED", value: total, color: Colors.accent },
                        { label: "APPROVAL RATE", value: `${approvalRate}%`, color: Colors.approved },
                        { label: "DENIED RATE", value: `${deniedRate}%`, color: Colors.denied },
                        { label: "PENDING", value: `${pendingRate}%`, color: Colors.pending },
                    ].map((s) => (
                        <View key={s.label} style={styles.statBox}>
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Status Distribution ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Status Distribution</Text>
                    <Text style={styles.cardSub}>Current status breakdown of all cases</Text>

                    <View style={styles.donutRow}>
                        {/* Donut chart — explicit size wrapper prevents SVG from collapsing layout */}
                        <View style={{ width: 180, height: 180 }}>
                            <DonutChart
                                segments={statusSegments}
                                total={total}
                                size={180}
                                thickness={36}
                            />
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>
                            {statusSegments.map((seg) => {
                                const pct = Math.round((seg.count / total) * 100);
                                return (
                                    <View key={seg.key} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                                        <View>
                                            <Text style={styles.legendLabel}>{seg.label}</Text>
                                            <Text style={styles.legendCount}>
                                                {seg.count} ({pct}%)
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* ── Range Analysis ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Case Number Range Analysis</Text>
                    <Text style={styles.cardSub}>
                        Each bar is one neighboring case, colored by its current status
                    </Text>

                    <View onLayout={onRangeLayout}>
                        <RangeChart neighbors={neighbors} Colors={Colors} chartWidth={rangeChartW} />
                    </View>

                    {/* Chart legend */}
                    <View style={[styles.chartLegend, { marginTop: 14 }]}>
                        {statusSegments.map((seg) => (
                            <View key={seg.key} style={styles.chartLegendItem}>
                                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                                <Text style={styles.chartLegendText}>{seg.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Where Is USCIS Now? ── */}
                <View style={styles.card}>
                    <View style={styles.chartCardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Where Is USCIS Now?</Text>
                            <Text style={styles.cardSub}>Cases USCIS is working through, by filing date</Text>
                        </View>
                        {/* Normalized / Absolute toggle */}
                        <View style={styles.modeToggle}>
                            {["Normalized", "Absolute"].map((mode) => {
                                const active = normalizeWorking === (mode === "Normalized");
                                return (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[styles.modeBtn, active && styles.modeBtnActive]}
                                        onPress={() => setNormalizeWorking(mode === "Normalized")}
                                    >
                                        <Text style={[styles.modeBtnText, active && styles.modeBtnTextActive]}>
                                            {mode}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Filter chips */}
                    <View style={styles.filterRow}>
                        <FilterChip label="I-765" Colors={Colors} />
                        <FilterChip label="IOE"   Colors={Colors} />
                        <FilterChip label="IOE09" Colors={Colors} />
                    </View>

                    {/* Legend */}
                    <View style={styles.chartLegendRow}>
                        {CHART_STATUSES.map((s) => (
                            <View key={s.key} style={styles.chartLegendItem}>
                                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                                <Text style={styles.chartLegendText}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View onLayout={onUscisLayout}>
                        <USCISBarChart data={WORKING_DATA} normalize={normalizeWorking} Colors={Colors} chartWidth={uscisChartW} />
                    </View>
                </View>

                {/* ── How Busy Is USCIS? ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>How Busy Is USCIS?</Text>
                    <Text style={styles.cardSub}>See how many cases USCIS processed each day</Text>

                    {/* Filter chips */}
                    <View style={styles.filterRow}>
                        <FilterChip label="I-765" Colors={Colors} />
                        <FilterChip label="IOE"   Colors={Colors} />
                        <FilterChip label="IOE09" Colors={Colors} />
                    </View>

                    {/* Legend */}
                    <View style={styles.chartLegendRow}>
                        {CHART_STATUSES.map((s) => (
                            <View key={s.key} style={styles.chartLegendItem}>
                                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                                <Text style={styles.chartLegendText}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View onLayout={onUscisLayout}>
                        <USCISBarChart data={BUSY_DATA} normalize={false} Colors={Colors} chartWidth={uscisChartW} />
                    </View>

                    {/* Footer note */}
                    <View style={styles.chartNote}>
                        <Text style={styles.chartNoteIcon}>ℹ</Text>
                        <Text style={styles.chartNoteText}>
                            Each bar represents one working day. Taller bars mean USCIS was busier. Gaps usually mean weekends or holidays. The colors break down what happened — approvals, denials, RFEs, and more.
                        </Text>
                    </View>
                </View>

                {/* ── Cases List ── */}
                <View style={styles.card}>
                    <View style={styles.casesListHeader}>
                        <Text style={styles.cardTitle}>Cases List</Text>
                        <View style={styles.casesCountBadge}>
                            <Text style={styles.casesCountText}>{total} cases found</Text>
                        </View>
                    </View>

                    <View style={styles.casesList}>
                        {sortedNeighbors.map((n, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.caseRow,
                                    n.isCurrent && styles.caseRowCurrent,
                                    i < sortedNeighbors.length - 1 && styles.caseRowBorder,
                                ]}
                            >
                                {/* Status pill indicator */}
                                <View style={[styles.caseRowPill, { backgroundColor: n.status.color }]} />

                                <View style={{ flex: 1 }}>
                                    <View style={styles.caseRowTop}>
                                        <Text style={styles.caseReceipt}>{n.receipt}</Text>
                                        {n.isCurrent && (
                                            <View style={styles.youBadge}>
                                                <Text style={styles.youBadgeText}>YOU</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.caseStatus}>{n.status.label}</Text>
                                    <Text style={styles.caseMeta}>{n.form} · {n.date}</Text>
                                </View>

                                {/* Status dot */}
                                <View style={[styles.statusDot, { backgroundColor: n.status.color }]} />
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(Colors) {
    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.bg },

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
        headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.text, fontFamily: Fonts.display },
        headerSub: {
            fontSize: 11, color: Colors.textFaint,
            fontFamily: Fonts.monoBold, letterSpacing: 1, textTransform: "uppercase",
        },

        scroll: { paddingHorizontal: 18, paddingTop: 4 },

        // Summary stats
        statsRow: {
            flexDirection: "row", gap: 8, marginBottom: 18,
        },
        statBox: {
            flex: 1, backgroundColor: Colors.bgCardAlt, borderRadius: 12,
            paddingVertical: 14, paddingHorizontal: 6, alignItems: "center",
            minHeight: 72,
        },
        statValue: { fontSize: 18, fontWeight: "800", fontFamily: Fonts.display, marginBottom: 5 },
        statLabel: {
            fontSize: 7, color: Colors.textFaint, textTransform: "uppercase",
            letterSpacing: 0.5, fontFamily: Fonts.sansBold, textAlign: "center",
        },

        // Cards
        card: {
            backgroundColor: Colors.bgCard, borderRadius: 12,
            padding: 20, marginBottom: 18,
            ...Shadow.card,
        },
        cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: Fonts.displayBold, marginBottom: 3 },
        cardSub: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans, marginBottom: 18 },

        // Donut section
        donutRow: {
            flexDirection: "column", alignItems: "center", gap: 20,
        },
        legend: {
            flexDirection: "row", flexWrap: "wrap",
            justifyContent: "center", gap: 12,
            width: "100%",
        },
        legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
        legendDot: { width: 8, height: 8, borderRadius: 9999, marginTop: 3, flexShrink: 0 },
        legendLabel: { fontSize: 12, color: Colors.text, fontFamily: Fonts.sansSemiBold, fontWeight: "600" },
        legendCount: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.sans },

        // Range chart
        chartContainer: { marginBottom: 16 },
        chartLegend: {
            flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4,
        },
        chartLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
        chartLegendText: {
            fontSize: 10, color: Colors.textMuted,
            fontFamily: Fonts.sans, textTransform: "uppercase", letterSpacing: 0.5,
        },

        // USCIS bar charts
        chartCardHeader: {
            flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 0,
        },
        modeToggle: {
            flexDirection: "row", gap: 4, flexShrink: 0, marginTop: 2,
        },
        modeBtn: {
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 8, backgroundColor: Colors.bgCardAlt,
        },
        modeBtnActive: { backgroundColor: Colors.bgHighest },
        modeBtnText: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.sansSemiBold },
        modeBtnTextActive: { color: Colors.text, fontWeight: "700", fontFamily: Fonts.sansBold },
        filterRow: { flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 14 },
        chartLegendRow: {
            flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14,
        },
        chartNote: {
            flexDirection: "row", gap: 10, alignItems: "flex-start",
            backgroundColor: Colors.bgCardAlt, borderRadius: 10,
            padding: 12, marginTop: 14,
        },
        chartNoteIcon: {
            fontSize: 13, color: Colors.accent,
            fontFamily: Fonts.sansBold, fontWeight: "700",
        },
        chartNoteText: {
            flex: 1, fontSize: 11, color: Colors.textMuted,
            fontFamily: Fonts.sans, lineHeight: 17,
        },

        // Cases list
        casesListHeader: {
            flexDirection: "row", alignItems: "center",
            justifyContent: "space-between", marginBottom: 14,
        },
        casesCountBadge: {
            backgroundColor: Colors.bgCardAlt,
            borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4,
        },
        casesCountText: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.sansSemiBold },

        casesList: { gap: 0 },
        caseRow: {
            flexDirection: "row", alignItems: "center",
            paddingVertical: 12, paddingLeft: 8, gap: 12,
        },
        caseRowBorder: {
            borderBottomWidth: 1,
            borderBottomColor: Colors.bgSection,
        },
        caseRowCurrent: { backgroundColor: Colors.bgCardAlt, borderRadius: 10, paddingHorizontal: 8 },
        caseRowPill: { width: 3, height: 40, borderRadius: 9999, flexShrink: 0 },
        caseRowTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
        caseReceipt: {
            fontSize: 13, fontFamily: Fonts.monoBold,
            color: Colors.text, fontWeight: "700",
        },
        youBadge: {
            backgroundColor: Colors.accentLight,
            borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
        },
        youBadgeText: {
            fontSize: 9, fontWeight: "700", color: Colors.accent,
            fontFamily: Fonts.sansBold, letterSpacing: 0.5,
        },
        caseStatus: { fontSize: 12, color: Colors.textSub, fontFamily: Fonts.sansSemiBold, marginBottom: 1 },
        caseMeta: { fontSize: 11, color: Colors.textFaint, fontFamily: Fonts.sans },
        statusDot: { width: 10, height: 10, borderRadius: 9999, flexShrink: 0 },
    });
}
