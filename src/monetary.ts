import { StreamElementEvent } from "./types";

export function normalizeTip(amount: number) {
    return amount;
}

export function normalizeCheer(amount: number) {
    return amount / 100;
}

export function tierMultiplier(tier: number) {
    switch (tier) {
        case 1000:
            return 1;
        case 2000:
            return 2;
        case 3000:
            return 5;
        default:
            return 1;
    }
}

export function isResub(data: StreamElementEvent) {
    return data.amount != 1;
}
