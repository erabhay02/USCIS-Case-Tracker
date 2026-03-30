import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import StatusBadge from "./StatusBadge";
import { Fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

const PAGE_SIZE = 20;

export default function NeighborTable({ neighbors }) {
    const { Colors } = useTheme();
    const styles = useMemo(() => makeStyles(Colors), [Colors]);
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState("seq");
    const [filter, setFilter] = useState("all");

    if (!neighbors || neighbors.length === 0) return null;

    const filtered = filter === "all" ? neighbors : neighbors.filter((n) => n.status.key === filter);
    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === "seq") return parseInt(a.seq) - parseInt(b.seq);
        if (sortKey === "status") return a.status.key.localeCompare(b.status.key);
        return 0;
    });
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const page_data = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const filterOptions = [
        { key: "all", label: "All" },
        { key: "approved", label: "Approved" },
        { key: "processing", label: "Processing" },
        { key: "rfe_issued", label: "RFE" },
        { key: "denied", label: "Denied" },
    ];

    return (
        <View>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <View style={styles.filterRow}>
                    {filterOptions.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            onPress={() => { setFilter(f.key); setPage(0); }}
                            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Sort row */}
            <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort:</Text>
                {[{ key: "seq", label: "Case #" }, { key: "status", label: "Status" }].map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        onPress={() => setSortKey(s.key)}
                        style={[styles.sortBtn, sortKey === s.key && styles.sortBtnActive]}
                    >
                        <Text style={[styles.sortBtnText, sortKey === s.key && styles.sortBtnTextActive]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Text style={styles.countText}>{filtered.length} cases</Text>
            </View>

            {/* Table header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.colHead, { flex: 2 }]}>RECEIPT #</Text>
                <Text style={[styles.colHead, { flex: 1.5 }]}>STATUS</Text>
                <Text style={[styles.colHead, { flex: 0.8, textAlign: "right" }]}>CASE #</Text>
            </View>

            {/* Rows */}
            {page_data.map((n, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={[styles.cellReceipt, { flex: 2 }]}>{n.receipt}</Text>
                    <View style={{ flex: 1.5 }}>
                        <StatusBadge status={n.status} />
                    </View>
                    <Text style={[styles.cellSeq, { flex: 0.8, textAlign: "right" }]}>{n.seq}</Text>
                </View>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <View style={styles.pagRow}>
                    <TouchableOpacity
                        onPress={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={[styles.pagBtn, page === 0 && styles.pagBtnDisabled]}
                    >
                        <Text style={styles.pagBtnText}>← Prev</Text>
                    </TouchableOpacity>
                    <Text style={styles.pagInfo}>Page {page + 1} / {totalPages}</Text>
                    <TouchableOpacity
                        onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        style={[styles.pagBtn, page === totalPages - 1 && styles.pagBtnDisabled]}
                    >
                        <Text style={styles.pagBtnText}>Next →</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

function makeStyles(Colors) {
    return StyleSheet.create({
        filterScroll: { marginBottom: 12 },
        filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
        filterChip: {
            paddingHorizontal: 14, paddingVertical: 7,
            borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border,
            backgroundColor: Colors.bgCard,
        },
        filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
        filterChipText: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.sansSemiBold },
        filterChipTextActive: { color: "#fff" },

        sortRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
        sortLabel: { fontSize: 12, color: Colors.textFaint, fontFamily: Fonts.sans },
        sortBtn: {
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
        },
        sortBtnActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
        sortBtnText: { fontSize: 11, color: Colors.textMuted, fontFamily: Fonts.sans },
        sortBtnTextActive: { color: Colors.accent, fontWeight: "600" },
        countText: { marginLeft: "auto", fontSize: 11, color: Colors.textFaint, fontFamily: Fonts.sans },

        tableHeader: {
            flexDirection: "row", paddingVertical: 10, paddingHorizontal: 14,
            backgroundColor: Colors.bgCardAlt, borderRadius: 10, marginBottom: 4,
        },
        colHead: { fontSize: 10, fontWeight: "700", color: Colors.textFaint, fontFamily: Fonts.sansBold, letterSpacing: 1 },

        tableRow: {
            flexDirection: "row", alignItems: "center",
            paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10,
        },
        tableRowAlt: { backgroundColor: Colors.bgInput },
        cellReceipt: { fontSize: 12, color: Colors.text, fontFamily: Fonts.mono },
        cellSeq: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.mono },

        pagRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
        pagBtn: {
            paddingHorizontal: 16, paddingVertical: 8,
            borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
            backgroundColor: Colors.bgCard,
        },
        pagBtnDisabled: { opacity: 0.4 },
        pagBtnText: { fontSize: 13, color: Colors.accent, fontFamily: Fonts.sansSemiBold },
        pagInfo: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.sans },
    });
}
