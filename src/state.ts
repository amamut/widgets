import { slideOut } from "./animations/beer";
import { setCounter } from "./animations/odometer";
import { isResub, normalizeCheer, normalizeTip, tierMultiplier } from "./monetary";
import { EventType, StreamElementEvent } from "./types";

export const SUBCOST = 5;
export const MAXFILL = 80;
export const SUBPERCENT = 1;
export const CHEERPERCENT = 1;
export const TIPPERCENT = 1;

export function pushEvent(amount: number) {
    State.events.push({ amount });
}

export function queueEvent(event: StreamElementEvent) {
    if (event) {
        let donation = null;
        switch (event.type) {
            case EventType.Subscriber:
                if (event.bulkGifted) {
                    donation = tierMultiplier(event.tier) * SUBCOST * event.amount * SUBPERCENT;
                } else if (event.isCommunityGift) {
                    return;
                } else if (event.gifted) {
                    donation = tierMultiplier(event.tier) * SUBCOST * SUBPERCENT;
                } else {
                    donation = !isResub(event) ? tierMultiplier(event.tier) * SUBCOST * SUBPERCENT : 0;
                }
                break;
            case EventType.Tip:
                donation = normalizeTip(event.amount) * TIPPERCENT;
                break;
            case EventType.Cheer:
                donation = normalizeCheer(event.amount) * CHEERPERCENT;
                break;
            default:
                break;
        }
        if (donation) {
            pushEvent(donation);
        }
    }
}

export class State {
    static fillCounter = 0;
    static total = 0;
    static loading = false;
    static events: { amount: number }[] = [];
    static currentFill = 0;

    static async resetFill() {
        if (this.currentFill >= MAXFILL) {
            this.total = 0;
            this.currentFill = 0;
            return Promise.resolve(await slideOut());
        }
        return Promise.resolve();
    }

    static setFill() {
        this.currentFill = (this.total / 100) * MAXFILL;
        if (this.currentFill >= MAXFILL) {
            this.currentFill = MAXFILL;
            this.fillCounter++;
            setCounter();
        }
    }
}
