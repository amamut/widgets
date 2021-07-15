require("./includes/beer-fill.css");

import $ from "jquery";
import { beerPour, slideIn, slideOut } from "./animations/beer";
import { CHEERPERCENT, MAXFILL, State, SUBCOST, SUBPERCENT, TIPPERCENT } from "./state";
import { EventType, includeEvents, StreamElementEvent, StreamElementEventObject } from "./types";

function normalizeTip(amount: number) {
    return amount;
}

function normalizeCheer(amount: number) {
    return amount / 100;
}

function tierMultiplier(tier: number) {
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

function isResub(data: StreamElementEvent) {
    return data.amount != 1;
}

async function triggerAnimation() {
    await slideIn();
    await beerPour();
}

async function resetFill() {
    if (State.currentFill >= MAXFILL) {
        State.total = 0;
        State.currentFill = 0;
        return Promise.resolve(await slideOut());
    }
    return Promise.resolve();
}

function setFill() {
    State.currentFill = (State.total / 100) * MAXFILL;
    if (State.currentFill >= MAXFILL) {
        State.currentFill = MAXFILL;
        State.fillCounter++;
        setCounter();
    }
}

function pushEvent(amount: number) {
    State.events.push({ amount });
}

function queueEvent(event: StreamElementEvent) {
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

function setCounter() {
    setTimeout(function () {
        $("#odometer").html(String(State.fillCounter));
    }, 1000);
}

function init() {
    setCounter();
}

window.addEventListener("onEventReceived", async (evt: Event) => {
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
            await resetFill();
            State.total += donation.amount;
            setFill();
            await triggerAnimation();
            donation = State.events.shift();
        }
        State.loading = false;
    }
});

// window.addEventListener("onWidgetLoad", async (evt: Event) => {
//     const data = (<CustomEvent<StreamElementLoadingObject>>evt).detail.fieldData;
//     if (data.fillCounter) {
//         fillCounter = data.fillCounter;
//     }
//     if (data.counterColor) {
//         $("#odometer").css("color", data.counterColor);
//     }
//     if (data.startingAmount) {
//         total += data.startingAmount;
//         setFill();
//         await triggerAnimation();
//     }
// });

init();
