import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

const STATUS_ORDER = ["approved", "processing", "rfe_issued", "denied", "withdrawn"];

export default function ProgressBar({ data }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);

    const segments = [
        { key: "approved", color: Colors.approved, label: "Approved" },
        { key: "processing", color: "#3B82F6", label: "Processing" },
        { key: "rfe_issued", color: Colors.rfe, label: "RFE" },
        { key: "denied", color: Colors.denied, label: "Denied" },
        { key: "withdrawn", color: Colors.textFaint, label: "Other" },
    ];

    if (!data || data.length === 0) return null;

    const counts = STATUS_ORDER.reduce((acc, key) => {
        acc[key] = data.filter((n) => n.status.key === key).length;
        return acc;
    }, {});
    const total = data.length;

    return (
        <View>
            {/* Bar */}
            <View style={styles.barTrack}>
                {segments.map((seg) => {
                    const pct = (counts[seg.key] || 0) / total;
                    if (pct === 0) return null;
                    return (
                        <View
                            key={seg.key}
                            style={[styles.barSegment, { flex: pct, backgroundColor: seg.color }]}
                        />
                    );
                })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {segments.map((seg) => {
                    const count = counts[seg.key] || 0;
                    if (count === 0) return null;
                    const pct = Math.round((count / total) * 100);
                    return (
                        <View key={seg.key} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                            <Text style={styles.legendText}>{seg.label}</Text>
                            <Text style={styles.legendPct}>{pct}%</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

function makeStyles(Colors) {
    return StyleSheet.create({
        barTrack: {
            flexDirection: "row", height: 14, borderRadius: 10,
            overflow: "hidden", backgroundColor: Colors.border,
            marginBottom: 14,
        },
        barSegment: { height: "100%" },
        legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
        legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
        legendDot: { width: 10, height: 10, borderRadius: 5 },
        legendText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans },
        legendPct: { fontSize: 12, fontWeight: "700", color: Colors.text, fontFamily: Fonts.sansSemiBold },
    });
}
