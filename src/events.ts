import { EventEmitter } from "stream";
import { State } from "./state";
import { StreamElementLoadingObject } from "./types";

export const SUBCOST = 5;
export const MAXFILL = 80;
export const SUBPERCENT = 1;
export const CHEERPERCENT = 1;
export const TIPPERCENT = 1;

export class Events {
    constructor() {
        window.addEventListener("onWidgetLoad", registerOnLoad);
    }
}

const registerOnLoad = (evt: Event) => {
    const data = (<CustomEvent<StreamElementLoadingObject>>evt).detail.fieldData;
    if (data.fillCounter) {
        State.fillCounter = data.fillCounter;
    }
    if (data.counterColor) {
        $("#odometer").css("color", data.counterColor);
    }
    if (data.startingAmount) {
        State.total += data.startingAmount;
        setFill();
        await triggerAnimation();
    }
});

const listener = new EventEmitter();
