import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts, Shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function StatCard({ label, value, sub, color }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);

    return (
        <View style={styles.card}>
            <Text style={[styles.value, { color: color || Colors.accent }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
            {!!sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
    );
}

function makeStyles(Colors) {
    return StyleSheet.create({
        card: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard,             // surface-container-lowest (pure white)
            borderRadius: 12, padding: 16,
            minWidth: 120,
        },
        value: {
            fontSize: 26, fontWeight: "800",
            fontFamily: Fonts.display, marginBottom: 4,
        },
        label: {
            fontSize: 11, color: Colors.textMuted,
            fontFamily: Fonts.sans, fontWeight: "500",
            textTransform: "uppercase", letterSpacing: 0.8,
        },
        sub: {
            fontSize: 11, color: Colors.textFaint,
            marginTop: 3, fontFamily: Fonts.sans,
        },
    });
}
