import { slideOut } from "./animations/beer";
import { setCounter } from "./animations/odometer";

export const SUBCOST = 5;
export const SUBPERCENT = 1;
export const CHEERPERCENT = 1;
export const TIPPERCENT = 1;
export const MAXFILL = 100;

export function pushDonation(amount: number) {
    State.donations.push({ amount });
}

export class State {
    static fillCounter = 0;
    static total = 0;
    static loading = false;
    static donations: { amount: number }[] = [];
    static currentFill = 0;
    static maxFill = 100;

    static setMaxFill(max: number) {
        State.maxFill = max;
    }

    static async resetFill() {
        if (this.currentFill >= State.maxFill) {
            this.total = 0;
            this.currentFill = 0;
            return Promise.resolve(await slideOut());
        }
        return Promise.resolve();
    }

    static setFill() {
        this.currentFill = this.total * (MAXFILL / State.maxFill);
        console.log(this.total, MAXFILL);
        if (this.currentFill >= MAXFILL) {
            this.currentFill = MAXFILL;
            this.fillCounter++;
            setCounter();
        }
    }
}
