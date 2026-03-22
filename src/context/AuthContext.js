import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

const STORAGE_KEY = "@uscis_auth_user";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // restoring from storage

    // ── Restore session on launch ───────────────────────────────────────────
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((raw) => {
                if (raw) {
                    const saved = JSON.parse(raw);
                    setUser(saved.user);
                    setIsGuest(saved.isGuest || false);
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const persist = (u, guest) => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, isGuest: guest })).catch(() => { });
    };

    const signIn = ({ name, email }) => {
        const u = { name: name || email.split("@")[0], email, avatar: null };
        setUser(u);
        setIsGuest(false);
        persist(u, false);
    };

    const signUp = ({ name, email }) => {
        const u = { name, email, avatar: null };
        setUser(u);
        setIsGuest(false);
        persist(u, false);
    };

    const continueAsGuest = () => {
        const u = { name: "Guest", email: "", avatar: null };
        setUser(u);
        setIsGuest(true);
        persist(u, true);
    };

    const signOut = () => {
        setUser(null);
        setIsGuest(false);
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => { });
    };

    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{ user, isGuest, isAuthenticated, isLoading, signIn, signUp, continueAsGuest, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
