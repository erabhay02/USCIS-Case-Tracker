import AsyncStorage from "@react-native-async-storage/async-storage";

const TRACKED_KEY = "@uscis_tracked_cases";
const HISTORY_KEY = "@uscis_search_history";
const ONBOARDED_KEY = "@uscis_onboarded";

// ── Tracked Cases ──────────────────────────────────────────────────────────
export async function loadTrackedCases() {
    try {
        const raw = await AsyncStorage.getItem(TRACKED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveTrackedCases(cases) {
    try {
        await AsyncStorage.setItem(TRACKED_KEY, JSON.stringify(cases));
    } catch { }
}

// ── Search History ─────────────────────────────────────────────────────────
export async function loadSearchHistory() {
    try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function addToSearchHistory(receipt) {
    try {
        const existing = await loadSearchHistory();
        const updated = [receipt, ...existing.filter((r) => r !== receipt)].slice(0, 8);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

export async function clearSearchHistory() {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch { }
}

// ── Onboarding ─────────────────────────────────────────────────────────────
export async function hasOnboarded() {
    try {
        const val = await AsyncStorage.getItem(ONBOARDED_KEY);
        return val === "true";
    } catch {
        return false;
    }
}

export async function markOnboarded() {
    try {
        await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    } catch { }
}
