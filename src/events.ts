import { triggerAnimation } from "./animations/beer";
import { setCounter, setOdometerColor } from "./animations/odometer";
import { queueEvent, State } from "./state";
import { includeEvents, StreamElementEventObject, StreamElementLoadingObject } from "./types";

export class Events {
    constructor() {
        window.addEventListener("onWidgetLoad", registerOnLoad);
        window.addEventListener("onEventReceived", registerOnEventReceived);
    }
}

const registerOnEventReceived = async (evt: Event) => {
    if (!includeEvents.includes((<CustomEvent<StreamElementEventObject>>evt).detail.listener)) {
        return;
    }
    const event = (<CustomEvent<StreamElementEventObject>>evt).detail.event;
    queueEvent(event);
    if (!State.loading) {
        State.loading = true;
        let donation = State.events.shift();
        while (donation) {
            console.log(`Processing ${donation.amount}`);
            await State.resetFill();
            State.total += donation.amount;
            State.setFill();
            await triggerAnimation();
            donation = State.events.shift();
        }
        State.loading = false;
    }
};

const registerOnLoad = async (evt: Event) => {
    const data = (<CustomEvent<StreamElementLoadingObject>>evt).detail.fieldData;
    if (data.fillCounter !== undefined) {
        State.fillCounter = data.fillCounter;
        setCounter();
    }
    if (data.counterColor) {
        setOdometerColor(data.counterColor);
    }
    if (!!data.startingAmount) {
        State.total += data.startingAmount;
        State.setFill();
        await triggerAnimation();
    }
};
