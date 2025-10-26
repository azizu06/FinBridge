import fs from "fs";

const dataUrl = new URL("./mockTransactions.json", import.meta.url);
let cache;

function loadData() {
    if (!cache) {
        const raw = fs.readFileSync(dataUrl, "utf8");
        cache = JSON.parse(raw);
    }
    return cache;
}

export function getMockTransactions(userId) {
    const data = loadData();
    return data?.[userId] || null;
}

