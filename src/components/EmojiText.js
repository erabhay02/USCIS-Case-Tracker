import React from "react";
import { Text, Platform } from "react-native";

/**
 * Renders emoji reliably across React Native's New Architecture.
 * Setting fontFamily to undefined (not a custom font) ensures the OS
 * falls back to the system emoji font (Apple Color Emoji / Noto Emoji).
 */
export default function EmojiText({ children, size = 20, style }) {
    return (
        <Text
            style={[
                {
                    fontSize: size,
                    fontFamily: Platform.OS === "ios" ? "System" : undefined,
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}