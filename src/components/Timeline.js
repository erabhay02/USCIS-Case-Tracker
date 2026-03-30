import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function Timeline({ events }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);

    if (!events || events.length === 0) return null;

    return (
        <View style={styles.container}>
            {events.map((ev, i) => {
                const isLast = i === events.length - 1;
                return (
                    <View key={i} style={styles.row}>
                        {/* Spine */}
                        <View style={styles.spine}>
                            <View style={[styles.dot, { backgroundColor: ev.status?.color || Colors.accent }]} />
                            {!isLast && <View style={styles.line} />}
                        </View>

                        {/* Content */}
                        <View style={[styles.content, !isLast && { marginBottom: 24 }]}>
                            <Text style={styles.statusLabel}>{ev.status?.label || "Update"}</Text>
                            <Text style={styles.date}>{ev.date}</Text>
                            {!!ev.receipt && (
                                <Text style={styles.receipt}>{ev.receipt}</Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

function makeStyles(Colors) {
    return StyleSheet.create({
        container: { paddingTop: 4 },
        row: { flexDirection: "row" },
        spine: { width: 28, alignItems: "center" },
        dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: Colors.bg },
        line: { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2 },
        content: { flex: 1, paddingLeft: 12, paddingBottom: 4 },
        statusLabel: { fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: Fonts.sansBold, marginBottom: 4 },
        date: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sans, marginBottom: 4 },
        receipt: { fontSize: 12, color: Colors.accent, fontFamily: Fonts.mono },
    });
}
