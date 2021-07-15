export const SUBCOST = 5;
export const MAXFILL = 80;
export const SUBPERCENT = 1;
export const CHEERPERCENT = 1;
export const TIPPERCENT = 1;

export class State {
    static fillCounter = 0;
    static total = 0;
    static loading = false;
    static events: { amount: number }[] = [];
    static currentFill = 0;
}
