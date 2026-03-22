import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";
import { markOnboarded } from "../utils/storage";

const { width } = Dimensions.get("window");

const SLIDES = [
    {
        key: "1",
        icon: "⌗",
        iconBg: "#EEF0FF",
        title: "Track Your USCIS Case",
        desc: "Enter your receipt number to see your current case status instantly. Supports all service centers — EAC, WAC, LIN, SRC, and IOE.",
        accent: "#5B5FEF",
    },
    {
        key: "2",
        icon: "🔍",
        iconBg: "#C1F135",
        title: "Scan Neighboring Cases",
        desc: "See ±5, ±10, or ±20 cases filed around yours at the same center and day. Understand the approval patterns around your case.",
        accent: "#4A6000",
    },
    {
        key: "3",
        icon: "📊",
        iconBg: "#F5F3FF",
        title: "Approval Rate Stats",
        desc: "Live approval, RFE, and denial rates for cases like yours. Know your odds before your decision is made.",
        accent: "#8B5CF6",
    },
    {
        key: "4",
        icon: "📌",
        iconBg: "#F0FDF4",
        title: "Track Multiple Cases",
        desc: "Save and monitor multiple receipt numbers from one dashboard. Never lose track of any case — even after restarting the app.",
        accent: "#22C55E",
    },
];

export default function OnboardingScreen({ onDone }) {
    const { Colors } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatRef = React.useRef(null);

    const goNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
            setActiveIndex((i) => i + 1);
        } else {
            handleDone();
        }
    };

    const handleDone = async () => {
        await markOnboarded();
        onDone();
    };

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: Colors.bg }]}>
            <StatusBar style={Colors.isDark ? "light" : "dark"} />

            {/* Skip button */}
            <TouchableOpacity onPress={handleDone} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: Colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setActiveIndex(idx);
                }}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                            <Text style={styles.iconText}>{item.icon}</Text>
                        </View>
                        <Text style={[styles.slideTitle, { color: Colors.text }]}>{item.title}</Text>
                        <Text style={[styles.slideDesc, { color: Colors.textMuted }]}>{item.desc}</Text>
                    </View>
                )}
            />

            {/* Dots */}
            <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: i === activeIndex ? Colors.accent : Colors.border,
                                width: i === activeIndex ? 24 : 8,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: Colors.accent }]}
                onPress={goNext}
                activeOpacity={0.85}
            >
                <Text style={styles.ctaBtnText}>{isLast ? "Get Started" : "Next →"}</Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    skipBtn: { alignSelf: "flex-end", paddingHorizontal: 24, paddingVertical: 12 },
    skipText: { fontSize: 14, fontWeight: "600" },
    slide: {
        flex: 1, paddingHorizontal: 40,
        justifyContent: "center", alignItems: "center",
        paddingTop: 20,
    },
    iconCircle: {
        width: 120, height: 120, borderRadius: 40,
        alignItems: "center", justifyContent: "center",
        marginBottom: 40,
    },
    iconText: { fontSize: 52 },
    slideTitle: {
        fontSize: 28, fontWeight: "800", textAlign: "center",
        marginBottom: 16, lineHeight: 36,
    },
    slideDesc: {
        fontSize: 16, lineHeight: 26,
        textAlign: "center",
    },
    dotsRow: {
        flexDirection: "row", justifyContent: "center",
        alignItems: "center", gap: 8, marginBottom: 32,
    },
    dot: { height: 8, borderRadius: 4 },
    ctaBtn: {
        marginHorizontal: 24, borderRadius: 18,
        paddingVertical: 18, alignItems: "center",
    },
    ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
