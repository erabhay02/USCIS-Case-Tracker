export const Colors = {
    // Surface layers
    bg: "#f8f9fa",
    bgCard: "#ffffff",
    bgCardAlt: "#f3f4f5",
    bgInput: "#f3f4f5",
    bgSection: "#edeeef",
    bgHighest: "#e1e3e4",

    // Borders (ghost — felt, not seen)
    border: "rgba(194, 198, 213, 0.15)",
    borderFaint: "rgba(194, 198, 213, 0.10)",
    borderFull: "#c2c6d5",

    // Primary brand blue
    accent: "#003c87",
    accentLight: "#e8f0fb",
    accentDark: "#002d6b",
    accentGradientEnd: "#0052b4",

    // Semantic
    secondary: "#505f75",
    surfaceTint: "#175bbd",

    // Text
    text: "#191c1d",
    textSub: "#424752",
    textMuted: "#424752",
    textFaint: "#6d7380",
    textInverse: "#ffffff",

    // Status
    approved: "#16a34a",
    approvedBg: "#f0fdf4",
    approvedChipBg: "#00624b",
    approvedChipText: "#002117",
    pending: "#d97706",
    pendingBg: "#fffbeb",
    pendingChipBg: "#d4e3fe",
    pendingChipText: "#39485d",
    denied: "#dc2626",
    deniedBg: "#fef2f2",
    rfe: "#7c3aed",
    rfeBg: "#f5f3ff",
    error: "#b91c1c",

    // Shadows (ambient — natural light feel)
    shadow: "rgba(0, 26, 66, 0.06)",
    shadowDark: "rgba(0, 26, 66, 0.10)",

    // Highlight
    lime: "#C1F135",
    limeText: "#4A6000",

    isDark: false,
};

export const Fonts = {
    display: "Manrope_800ExtraBold",
    displayBold: "Manrope_700Bold",
    mono: "JetBrainsMono_400Regular",
    monoBold: "JetBrainsMono_700Bold",
    sans: "Inter_400Regular",
    sansBold: "Inter_700Bold",
    sansSemiBold: "Inter_600SemiBold",
};

export const Shadow = {
    card: {
        shadowColor: "#001a42",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
    },
    cardStrong: {
        shadowColor: "#001a42",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 32,
        elevation: 4,
    },
};
