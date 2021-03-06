require("./includes/beer-fill.css");
import { Events, EventType, StreamElementEvent, StreamElementLoadingObject } from "@amamut/streamelementsevents";
import { triggerAnimation } from "./animations/beer";
import { setCounter, setOdometerColor } from "./animations/odometer";
import { normalizeCheer, normalizeTip, tierMultiplier } from "./monetary";
import { CHEERPERCENT, pushDonation, State, SUBCOST, SUBPERCENT, TIPPERCENT } from "./state";

const postProcess = async () => {
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
    if (data.maxFill !== undefined && !isNaN(data.maxFill)) {
        State.setMaxFill(data.maxFill);
    }
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
events.registerPostEventHandler(postProcess);

events.on(EventType.Sub, (event: StreamElementEvent) => {
    const donation = tierMultiplier(event.tier) * SUBCOST * SUBPERCENT;
    if (donation) {
        pushDonation(donation);
    }
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
