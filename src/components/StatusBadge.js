import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function StatusBadge({ status, size = "md" }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(), []);

    const STATUS_CONFIG = {
        approved: {
            label: "Approved",
            bg: Colors.approvedChipBg,
            text: Colors.approvedChipText,
            dot: Colors.approvedChipText,
        },
        denied: {
            label: "Denied",
            bg: Colors.denied,
            text: "#fff",
            dot: "#fff",
        },
        rfe_issued: {
            label: "RFE Issued",
            bg: Colors.rfeBg,
            text: Colors.rfe,
            dot: Colors.rfe,
        },
        rfe_received: {
            label: "RFE Received",
            bg: Colors.rfeBg,
            text: Colors.rfe,
            dot: Colors.rfe,
        },
        received: {
            label: "Received",
            bg: Colors.pendingChipBg,
            text: Colors.pendingChipText,
            dot: Colors.pendingChipText,
        },
        processing: {
            label: "Processing",
            bg: Colors.pendingChipBg,
            text: Colors.pendingChipText,
            dot: Colors.pendingChipText,
        },
        transferred: {
            label: "Transferred",
            bg: Colors.rfeBg,
            text: Colors.rfe,
            dot: Colors.rfe,
        },
        withdrawn: {
            label: "Withdrawn",
            bg: Colors.bgCardAlt || Colors.bgSection,
            text: Colors.textFaint,
            dot: Colors.textFaint,
        },
    };

    const cfg = STATUS_CONFIG[status?.key] || STATUS_CONFIG.received;
    const isLg = size === "lg";

    return (
        <View style={[styles.badge, { backgroundColor: cfg.bg }, isLg && styles.badgeLg]}>
            <View style={[styles.dot, { backgroundColor: cfg.dot }, isLg && styles.dotLg]} />
            <Text style={[styles.label, { color: cfg.text }, isLg && styles.labelLg]}>
                {status?.label || cfg.label}
            </Text>
        </View>
    );
}

function makeStyles() {
    return StyleSheet.create({
        badge: {
            flexDirection: "row", alignItems: "center", gap: 6,
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 9999, alignSelf: "flex-start",
        },
        badgeLg: { paddingHorizontal: 14, paddingVertical: 8 },
        dot: { width: 6, height: 6, borderRadius: 9999 },
        dotLg: { width: 8, height: 8 },
        label: { fontSize: 11, fontWeight: "600", fontFamily: Fonts.sansSemiBold, letterSpacing: 0.3 },
        labelLg: { fontSize: 13 },
    });
}
