require("./beer-fill.css");

import $ from "jquery";
import {
    EventType,
    includeEvents,
    StreamElementEvent,
    StreamElementEventObject,
    StreamElementLoadingObject
} from "./types";

const events: { amount: number }[] = [];
let loading = false;
let total = 0;

const SUBCOST = 5;

const MAXFILL = 80;
let currentFill = 0;

const subPercent = 1;
const cheerPercent = 1;
const tipPercent = 1;

let fillCounter = 0;

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

function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms, null));
}

function slideIn() {
    const glass = $(".glass");
    glass.animate(
        {
            opacity: 1,
            left: "300px"
        },
        1000
    );
    return glass.promise();
}

async function slideOut() {
    const glass = $(".glass");
    glass.animate({
        opacity: 0,
        left: "600px"
    });
    await glass.promise();
    glass.css({
        left: 0
    });
    const beer = $(".beer");
    beer.css({
        height: 0,
        "border-width": 0
    });
    const foam = $(".foam");
    foam.css({
        top: 0,
        height: 0
    });
}

async function beerPour() {
    const handle = $("#pipe-handle");
    handle.toggleClass("pull");
    const pipe = $("#pipe");
    pipe.toggleClass("flow");
    await timeout(1000);
    await beerFill();

    // Wait to finish pour
    await timeout(3000);
    pipe.toggleClass("flow");
    handle.toggleClass("pull");
    return pipe.promise();
}

async function beerFill() {
    const beer = $(".beer");
    const foam = $(".foam");
    beer.animate(
        {
            height: `${currentFill}px`,
            "border-width": 0
        },
        {
            duration: 2000,
            easing: "linear",
            queue: true
        }
    );
    await beer.promise();
    foam.animate(
        {
            top: "-14px",
            height: "15px"
        },
        {
            start: function () {
                foam.toggleClass("wave");
            },
            complete: async function () {
                await timeout(1000);
                foam.toggleClass("wave");
            },
            queue: false
        }
    );
}

async function triggerAnimation() {
    await slideIn();
    await beerPour();
}

async function resetFill() {
    if (currentFill >= MAXFILL) {
        total = 0;
        currentFill = 0;
        return Promise.resolve(await slideOut());
    }
    return Promise.resolve();
}

function setFill() {
    currentFill = (total / 100) * MAXFILL;
    if (currentFill >= MAXFILL) {
        currentFill = MAXFILL;
        fillCounter++;
        setCounter();
    }
}

function pushEvent(amount: number) {
    events.push({ amount });
}

function queueEvent(event: StreamElementEvent) {
    if (event) {
        let donation = null;
        switch (event.type) {
            case EventType.Subscriber:
                if (event.bulkGifted) {
                    donation = tierMultiplier(event.tier) * SUBCOST * event.amount * subPercent;
                } else if (event.isCommunityGift) {
                    return;
                } else if (event.gifted) {
                    donation = tierMultiplier(event.tier) * SUBCOST * subPercent;
                } else {
                    donation = !isResub(event) ? tierMultiplier(event.tier) * SUBCOST * subPercent : 0;
                }
                break;
            case EventType.Tip:
                donation = normalizeTip(event.amount) * tipPercent;
                break;
            case EventType.Cheer:
                donation = normalizeCheer(event.amount) * cheerPercent;
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
        $("#odometer").html(String(fillCounter));
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
    if (!loading) {
        loading = true;
        let donation = events.shift();
        while (donation) {
            console.log(`Processing ${donation.amount}`);
            await resetFill();
            total += donation.amount;
            setFill();
            await triggerAnimation();
            donation = events.shift();
        }
        loading = false;
    }
});

window.addEventListener("onWidgetLoad", async (evt: Event) => {
    const data = (<CustomEvent<StreamElementLoadingObject>>evt).detail.fieldData;
    if (data.fillCounter) {
        fillCounter = data.fillCounter;
    }
    if (data.counterColor) {
        $("#odometer").css("color", data.counterColor);
    }
    if (data.startingAmount) {
        total += data.startingAmount;
        setFill();
        await triggerAnimation();
    }
});

init();
