/**
 * Background polling task — must be imported as a side-effect at the very top
 * of App.js BEFORE any component renders so TaskManager has the definition
 * registered when the OS wakes the app for a background fetch.
 */
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { loadTrackedCases, saveTrackedCases } from "./storage";
import { scheduleStatusChangeNotification } from "./notifications";
import { randomStatus } from "./uscisHelpers";

export const BACKGROUND_FETCH_TASK = "uscis-background-status-poll";

// ── Simulate a fresh status fetch for a receipt ───────────────────────────────
// In production replace this with a real USCIS API call.
export function fetchCurrentStatus() {
    return randomStatus();
}

// ── Task definition — runs when OS triggers background fetch ──────────────────
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const tracked = await loadTrackedCases();
        if (!tracked.length) return BackgroundFetch.BackgroundFetchResult.NoData;

        let changed = false;
        const updated = tracked.map((c) => {
            const newStatus = fetchCurrentStatus();
            if (newStatus.key !== c.status.key) {
                changed = true;
                scheduleStatusChangeNotification(c.receipt, c.status.label, newStatus.label);
                return { ...c, status: newStatus };
            }
            return c;
        });

        if (changed) {
            await saveTrackedCases(updated);
            return BackgroundFetch.BackgroundFetchResult.NewData;
        }
        return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// ── Register / unregister helpers ─────────────────────────────────────────────
export async function registerBackgroundPoll() {
    try {
        const status = await BackgroundFetch.getStatusAsync();
        if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
            status === BackgroundFetch.BackgroundFetchStatus.Denied) {
            return false;
        }
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 15 * 60, // 15 minutes
            stopOnTerminate: false,
            startOnBoot: true,
        });
        return true;
    } catch {
        return false;
    }
}

export async function unregisterBackgroundPoll() {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    } catch { }
}
