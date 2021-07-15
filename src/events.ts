import { EventEmitter } from "events";
import { isResub } from "./monetary";
import {
    EventType,
    includeEvents,
    StreamElementEvent,
    StreamElementEventObject,
    StreamElementsEventType
} from "./types";

type DonationEventHandler = (e: StreamElementEvent) => Promise<void> | void;

const POSTEVENT = "postevent";

export class Events {
    private eventEmitter = new EventEmitter();

    constructor() {
        this.registerOnEventReceived();
    }

    registerOnLoad(onload: (evt: Event) => Promise<void>) {
        window.addEventListener("onWidgetLoad", onload);
    }

    registerOnEventReceived() {
        window.addEventListener("onEventReceived", this.onEventReceived);
    }

    private wrapHandler = (f: DonationEventHandler) => {
        return async (e: StreamElementEvent) => {
            await f(e);
            this.eventEmitter.emit(POSTEVENT);
        };
    };

    onEventReceived = async (evt: Event) => {
        if (!includeEvents.includes((<CustomEvent<StreamElementEventObject>>evt).detail.listener)) {
            return;
        }
        const event = (<CustomEvent<StreamElementEventObject>>evt).detail.event;
        const incomingEvent = this.getEventType(event);
        if (incomingEvent) {
            this.eventEmitter.emit(incomingEvent, event);
        }
    };

    on(t: EventType, handler: DonationEventHandler) {
        this.eventEmitter.on(t, this.wrapHandler(handler));
    }

    async registerPostEventHandler(handler: () => Promise<any>) {
        this.eventEmitter.on(POSTEVENT, handler);
    }

    getEventType(event: StreamElementEvent) {
        if (event) {
            switch (event.type) {
                case StreamElementsEventType.Subscriber:
                    if (event.bulkGifted) {
                        return EventType.CommunityGift;
                    } else if (event.isCommunityGift) {
                        return EventType.Giftee;
                    } else if (event.gifted) {
                        return EventType.Gift;
                    } else {
                        return !isResub(event) ? EventType.Sub : EventType.Resub;
                    }
                case StreamElementsEventType.Tip:
                    return EventType.Tip;
                case StreamElementsEventType.Cheer:
                    return EventType.Cheer;
                default:
                    break;
            }
        }
        return null;
    }
}
