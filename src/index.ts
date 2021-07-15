require("./includes/beer-fill.css");
import { triggerAnimation } from "./animations/beer";
import { setCounter, setOdometerColor } from "./animations/odometer";
import { Events } from "./events";
import { normalizeCheer, normalizeTip, tierMultiplier } from "./monetary";
import { CHEERPERCENT, pushDonation, State, SUBCOST, SUBPERCENT, TIPPERCENT } from "./state";
import { EventType, StreamElementEvent, StreamElementLoadingObject } from "./types";

const processEvent = async () => {
    if (!State.loading) {
        State.loading = true;
        let donation = State.donations.shift();
        while (donation) {
            console.log(`Processing ${donation.amount}`);
            await State.resetFill();
            State.total += donation.amount;
            State.setFill();
            await triggerAnimation();
            donation = State.donations.shift();
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

const events = new Events();
events.registerOnLoad(registerOnLoad);
events.registerPostEventHandler(processEvent);

events.on(EventType.Sub, (event: StreamElementEvent) => {
    const donation = tierMultiplier(event.tier) * SUBCOST * SUBPERCENT;
    if (donation) {
        pushDonation(donation);
    }
});

events.on(EventType.Resub, (event: StreamElementEvent) => {
    // Do nothing, skip
});

events.on(EventType.Giftee, (event: StreamElementEvent) => {
    // Do Nothing, skip
});

events.on(EventType.Gift, (event: StreamElementEvent) => {
    const donation = tierMultiplier(event.tier) * SUBCOST * SUBPERCENT;
    if (donation) {
        pushDonation(donation);
    }
});

events.on(EventType.CommunityGift, (event: StreamElementEvent) => {
    const donation = tierMultiplier(event.tier) * SUBCOST * event.amount * SUBPERCENT;
    if (donation) {
        pushDonation(donation);
    }
});

events.on(EventType.Tip, (event: StreamElementEvent) => {
    const donation = normalizeTip(event.amount) * TIPPERCENT;
    if (donation) {
        pushDonation(donation);
    }
});

events.on(EventType.Cheer, (event: StreamElementEvent) => {
    const donation = normalizeCheer(event.amount) * CHEERPERCENT;
    if (donation) {
        pushDonation(donation);
    }
});
