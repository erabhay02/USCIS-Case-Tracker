import React, { useRef, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { autoFormatReceipt } from "../utils/uscisHelpers";
import { Fonts, Shadow } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function ReceiptInput({ value, onChange, onSearch, loading }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);
    const inputRef = useRef(null);

    const handleChange = (text) => {
        onChange(autoFormatReceipt(text));
    };

    return (
        <View>
            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>RECEIPT NUMBER</Text>
                {/* Minimalist input — surface-container-low fill, no border box */}
                <View style={styles.inputRow}>
                    <View style={styles.inputIconBox}>
                        <Text style={styles.inputIcon}>#</Text>
                    </View>
                    <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={handleChange}
                        onSubmitEditing={onSearch}
                        placeholder="EAC-23-015-50023"
                        placeholderTextColor={Colors.textFaint}
                        maxLength={18}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="search"
                        style={styles.input}
                    />
                </View>
                <TouchableOpacity
                    onPress={onSearch}
                    disabled={loading}
                    style={[styles.searchBtn, { opacity: loading ? 0.7 : 1 }]}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.searchBtnText}>Search Case →</Text>
                    )}
                </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
                Format:{" "}
                <Text style={{ color: Colors.textSub, fontWeight: "600" }}>
                    PREFIX-YY-DDD-NNNNN
                </Text>
                {"   ·   "}e.g. EAC-23-015-50023
            </Text>
        </View>
    );
}

function makeStyles(Colors) {
    return StyleSheet.create({
        inputCard: {
            ...Shadow.card,
            backgroundColor: Colors.bgCard,
            borderRadius: 16, padding: 20,
            marginBottom: 8,
        },
        inputLabel: {
            fontSize: 11, fontWeight: "700", color: Colors.textFaint,
            fontFamily: Fonts.sansBold, letterSpacing: 0.8,
            textTransform: "uppercase", marginBottom: 12,
        },
        // Minimalist input: surface-container-low fill, md radius, no border
        inputRow: {
            flexDirection: "row", alignItems: "center",
            backgroundColor: Colors.bgInput, borderRadius: 6,
            paddingLeft: 4, marginBottom: 14,
        },
        inputIconBox: {
            width: 38, height: 38, borderRadius: 8,
            backgroundColor: Colors.accentLight,
            alignItems: "center", justifyContent: "center", marginLeft: 4,
        },
        inputIcon: { color: Colors.accent, fontSize: 16, fontWeight: "800", fontFamily: Fonts.sansBold },
        input: {
            flex: 1, paddingHorizontal: 12, paddingVertical: 14,
            fontSize: 16, color: Colors.text,
            fontFamily: Fonts.mono, letterSpacing: 1,
        },
        // CTA: gradient primary → primary_container (solid primary as fallback)
        searchBtn: {
            backgroundColor: Colors.accent, borderRadius: 10,
            paddingVertical: 16, alignItems: "center",
        },
        searchBtnText: {
            color: "#fff", fontSize: 15, fontWeight: "700",
            fontFamily: Fonts.sansBold,
        },
        hint: {
            fontSize: 11, color: Colors.textFaint,
            fontFamily: Fonts.sans, marginLeft: 4,
        },
    });
}
