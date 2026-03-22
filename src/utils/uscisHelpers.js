// ── USCIS Tracker — Pure JS Helpers ──────────────────────────────────────────

export const SERVICE_CENTERS = {
    EAC: "Vermont",
    WAC: "California",
    LIN: "Nebraska",
    SRC: "Texas",
    IOE: "Online",
    NBC: "National Benefits Center",
    MSC: "National Benefits Center",
};

export const FORM_TYPES = {
    "I-485": "Adjustment of Status",
    "I-131": "Travel Document / Advance Parole",
    "I-765": "Employment Authorization",
    "I-140": "Immigrant Petition",
    "I-130": "Petition for Alien Relative",
    "I-751": "Remove Conditions on Residence",
    "N-400": "Naturalization Application",
};

export const STATUSES = [
    { key: "received", label: "Case Received", color: "#60a5fa", icon: "●" },
    { key: "processing", label: "Being Actively Reviewed", color: "#fbbf24", icon: "◐" },
    { key: "rfe_issued", label: "RFE Issued", color: "#f97316", icon: "⚠" },
    { key: "rfe_received", label: "RFE Response Received", color: "#a78bfa", icon: "↩" },
    { key: "approved", label: "Case Approved", color: "#34d399", icon: "✓" },
    { key: "denied", label: "Case Denied", color: "#f87171", icon: "✕" },
    { key: "transferred", label: "Case Transferred", color: "#94a3b8", icon: "→" },
    { key: "interview", label: "Interview Scheduled", color: "#e879f9", icon: "◆" },
];

export function randomStatus() {
    const weights = [10, 20, 5, 5, 45, 8, 4, 3];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return STATUSES[i];
    }
    return STATUSES[0];
}

export function parseReceipt(raw) {
    const r = raw.replace(/[-\s]/g, "").toUpperCase();
    if (r.length !== 13) return null;
    const prefix = r.slice(0, 3);
    const year = r.slice(3, 5);
    const day = r.slice(5, 8);
    const seq = r.slice(8, 13);
    if (!SERVICE_CENTERS[prefix]) return null;
    return { prefix, year, day, seq, full: raw.toUpperCase() };
}

export function formatReceipt(prefix, year, day, seq) {
    return `${prefix}-${year}-${day}-${seq.toString().padStart(5, "0")}`;
}

export function generateNeighbors(parsed, count) {
    const base = parseInt(parsed.seq);
    const results = [];
    for (let i = -count; i <= count; i++) {
        const seqNum = base + i;
        if (seqNum < 10000 || seqNum > 99999) continue;
        const st = randomStatus();
        const formKeys = Object.keys(FORM_TYPES);
        const form = formKeys[Math.floor(Math.random() * formKeys.length)];
        results.push({
            receipt: formatReceipt(parsed.prefix, parsed.year, parsed.day, seqNum.toString()),
            offset: i,
            status: st,
            form,
            isCurrent: i === 0,
            date: `${2020 + parseInt(parsed.year) % 5}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        });
    }
    return results;
}

export function autoFormatReceipt(raw) {
    let v = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    let out = "";
    if (v.length > 0) out = v.slice(0, 3);
    if (v.length > 3) out += "-" + v.slice(3, 5);
    if (v.length > 5) out += "-" + v.slice(5, 8);
    if (v.length > 8) out += "-" + v.slice(8, 13);
    return out;
}
