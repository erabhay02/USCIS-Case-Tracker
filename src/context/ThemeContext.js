import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext(null);
const THEME_KEY = "@uscis_theme";

export const LightColors = {
    // Surface layers — The "Limitless" system
    bg: "#f8f9fa",                          // surface: base layer
    bgCard: "#ffffff",                       // surface-container-lowest: cards
    bgCardAlt: "#f3f4f5",                   // surface-container-low: alt areas
    bgInput: "#f3f4f5",                     // surface-container-low: inputs
    bgSection: "#edeeef",                   // surface-container: sections
    bgHighest: "#e1e3e4",                   // surface-container-highest: active inputs

    // Borders — Ghost border fallback only
    border: "rgba(194, 198, 213, 0.15)",    // outline_variant at 15% — felt, not seen
    borderFaint: "rgba(194, 198, 213, 0.10)",
    borderFull: "#c2c6d5",                  // full outline_variant for accessibility

    // Primary brand blue
    accent: "#003c87",                       // primary
    accentLight: "#e8f0fb",                  // primary tint
    accentDark: "#002d6b",
    accentGradientEnd: "#0052b4",            // primary_container

    // Semantic support colors
    secondary: "#505f75",
    surfaceTint: "#175bbd",

    // Text — never pure black
    text: "#191c1d",                         // on_background
    textSub: "#424752",                      // on_surface_variant
    textMuted: "#424752",
    textFaint: "#6d7380",
    textInverse: "#ffffff",

    // Status (semantic colors)
    approved: "#16a34a",
    approvedBg: "#f0fdf4",
    approvedChipBg: "#00624b",               // tertiary_container
    approvedChipText: "#002117",             // on_tertiary_fixed
    pending: "#d97706",
    pendingBg: "#fffbeb",
    pendingChipBg: "#d4e3fe",               // secondary_fixed
    pendingChipText: "#39485d",             // on_secondary_fixed_variant
    denied: "#dc2626",
    deniedBg: "#fef2f2",
    rfe: "#7c3aed",
    rfeBg: "#f5f3ff",
    error: "#b91c1c",

    // Shadows (ambient — on_primary_fixed tint)
    shadow: "rgba(0, 26, 66, 0.06)",
    shadowDark: "rgba(0, 26, 66, 0.10)",

    // Accent highlight
    lime: "#C1F135",
    limeText: "#4A6000",

    isDark: false,
};

export const DarkColors = {
    bg: "#0f1117",
    bgCard: "#1a1d27",
    bgCardAlt: "#1e2130",
    bgInput: "#1e2130",
    bgSection: "#22263a",
    bgHighest: "#282d42",

    border: "rgba(194, 198, 213, 0.10)",
    borderFaint: "rgba(194, 198, 213, 0.06)",
    borderFull: "#3a3f5c",

    accent: "#4a8fd6",
    accentLight: "#0d2040",
    accentDark: "#2d6fae",
    accentGradientEnd: "#1a5fa8",

    secondary: "#90a4c0",
    surfaceTint: "#175bbd",

    text: "#e8eaf0",
    textSub: "#9ca3af",
    textMuted: "#9ca3af",
    textFaint: "#6b7280",
    textInverse: "#0f1117",

    approved: "#4ade80",
    approvedBg: "#052e16",
    approvedChipBg: "#004d3a",
    approvedChipText: "#b7f5e0",
    pending: "#fcd34d",
    pendingBg: "#1c1300",
    pendingChipBg: "#1e3a5f",
    pendingChipText: "#90b8e8",
    denied: "#f87171",
    deniedBg: "#1f0a0a",
    rfe: "#a78bfa",
    rfeBg: "#1a0f35",
    error: "#ef4444",

    shadow: "rgba(0, 0, 0, 0.40)",
    shadowDark: "rgba(0, 0, 0, 0.50)",

    lime: "#C1F135",
    limeText: "#C1F135",

    isDark: true,
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY)
            .then((val) => { if (val === "dark") setIsDark(true); })
            .catch(() => { });
    }, []);

    const toggleTheme = () => {
        setIsDark((prev) => {
            const next = !prev;
            AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => { });
            return next;
        });
    };

    const Colors = isDark ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, Colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
