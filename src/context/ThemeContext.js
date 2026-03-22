import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext(null);
const THEME_KEY = "@uscis_theme";

export const LightColors = {
    bg: "#F5F7FF",
    bgCard: "#FFFFFF",
    bgCardAlt: "#F0F2FF",
    bgInput: "#F8F9FF",
    border: "#E8EAFF",
    borderFaint: "#F0F1FF",
    accent: "#5B5FEF",
    accentLight: "#EEF0FF",
    accentDark: "#4347D9",
    lime: "#C1F135",
    limeDark: "#A8D929",
    limeText: "#4A6000",
    text: "#1A1D23",
    textSub: "#454A5E",
    textMuted: "#7B80A0",
    textFaint: "#A0A5C0",
    textInverse: "#FFFFFF",
    approved: "#22C55E",
    approvedBg: "#F0FDF4",
    pending: "#F59E0B",
    pendingBg: "#FFFBEB",
    denied: "#EF4444",
    deniedBg: "#FFF1F2",
    rfe: "#8B5CF6",
    rfeBg: "#F5F3FF",
    shadow: "rgba(91, 95, 239, 0.12)",
    shadowDark: "rgba(0, 0, 0, 0.08)",
    isDark: false,
};

export const DarkColors = {
    bg: "#0F1117",
    bgCard: "#1A1D27",
    bgCardAlt: "#22263A",
    bgInput: "#1E2130",
    border: "#2A2D45",
    borderFaint: "#222540",
    accent: "#7C80F5",
    accentLight: "#1E2045",
    accentDark: "#5B5FEF",
    lime: "#C1F135",
    limeDark: "#A8D929",
    limeText: "#C1F135",
    text: "#F0F2FF",
    textSub: "#B0B5D0",
    textMuted: "#7B80A0",
    textFaint: "#4A4F6A",
    textInverse: "#0F1117",
    approved: "#4ADE80",
    approvedBg: "#052E16",
    pending: "#FCD34D",
    pendingBg: "#1C1300",
    denied: "#F87171",
    deniedBg: "#1F0A0A",
    rfe: "#A78BFA",
    rfeBg: "#1A0F35",
    shadow: "rgba(0, 0, 0, 0.4)",
    shadowDark: "rgba(0, 0, 0, 0.5)",
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
