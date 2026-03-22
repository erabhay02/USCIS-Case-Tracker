import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts } from "../theme";

const STATUS_CONFIG = {
    approved: { label: "Approved", bg: Colors.approvedBg, text: Colors.approved, dot: Colors.approved },
    denied: { label: "Denied", bg: Colors.deniedBg, text: Colors.denied, dot: Colors.denied },
    rfe_issued: { label: "RFE Issued", bg: Colors.rfeBg, text: Colors.rfe, dot: Colors.rfe },
    rfe_received: { label: "RFE Received", bg: Colors.rfeBg, text: Colors.rfe, dot: Colors.rfe },
    received: { label: "Received", bg: Colors.pendingBg, text: Colors.pending, dot: Colors.pending },
    processing: { label: "Processing", bg: "#EFF6FF", text: "#3B82F6", dot: "#3B82F6" },
    transferred: { label: "Transferred", bg: "#F5F3FF", text: "#7C3AED", dot: "#7C3AED" },
    withdrawn: { label: "Withdrawn", bg: "#F9FAFB", text: "#6B7280", dot: "#9CA3AF" },
};

export default function StatusBadge({ status, size = "md" }) {
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

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, alignSelf: "flex-start",
    },
    badgeLg: { paddingHorizontal: 14, paddingVertical: 8 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    dotLg: { width: 9, height: 9 },
    label: { fontSize: 12, fontWeight: "600", fontFamily: Fonts.sansSemiBold },
    labelLg: { fontSize: 14 },
});
