// Background task definition must be imported before any component renders
import "./src/utils/backgroundPoll";

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
    useFonts,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import {
    Manrope_700Bold,
    Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { View, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { setNotificationHandler, configureNotificationChannel } from "./src/utils/notifications";
import { hasOnboarded } from "./src/utils/storage";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import AuthScreen from "./src/screens/AuthScreen";
import TrackerScreen from "./src/screens/TrackerScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AnalysisScreen from "./src/screens/AnalysisScreen";
import VisaBulletinScreen from "./src/screens/VisaBulletinScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const { Colors } = useTheme();
    const [showOnboarding, setShowOnboarding] = useState(null); // null = checking

    useEffect(() => {
        hasOnboarded().then((done) => setShowOnboarding(!done));
        // Set up notification handler and Android channel once on mount
        setNotificationHandler();
        configureNotificationChannel();
    }, []);

    // Loading — restoring auth session or checking onboarding
    if (isLoading || showOnboarding === null) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color={Colors.accent} size="large" />
            </View>
        );
    }

    // First-time onboarding
    if (showOnboarding) {
        return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Tracker" component={TrackerScreen} />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{ animation: "slide_from_right" }}
                        />
                        <Stack.Screen
                            name="Analysis"
                            component={AnalysisScreen}
                            options={{ animation: "slide_from_bottom" }}
                        />
                        <Stack.Screen
                            name="VisaBulletin"
                            component={VisaBulletinScreen}
                            options={{ animation: "slide_from_bottom" }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        JetBrainsMono_400Regular,
        JetBrainsMono_700Bold,
        Manrope_700Bold,
        Manrope_800ExtraBold,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: "#f8f9fa", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color="#003c87" size="large" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <AppNavigator />
                        <StatusBar style="auto" />
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
