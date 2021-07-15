import { EventEmitter } from "events";
import { isResub } from "./monetary";
import {
    EventType,
    includeEvents,
    StreamElementEvent,
    StreamElementEventObject,
    StreamElementsEventType
} from "./types";

const POSTEVENT = "postevent";

export class Events {
    private eventEmitter = new EventEmitter();

    constructor() {
        console.log(this.eventEmitter);
        this.registerOnEventReceived();
    }

    registerOnLoad<T>(onload: (evt: Event) => Promise<T>) {
        window.addEventListener("onWidgetLoad", onload);
    }

    registerOnEventReceived() {
        window.addEventListener("onEventReceived", this.onEventReceived);
    }

    onEventReceived = async (evt: Event) => {
        if (!includeEvents.includes((<CustomEvent<StreamElementEventObject>>evt).detail.listener)) {
            return;
        }
        const event = (<CustomEvent<StreamElementEventObject>>evt).detail.event;
        const incomingEvent = this.getEventType(event);
        if (incomingEvent) {
            console.log("EVENT: ", incomingEvent);
            this.eventEmitter.emit(incomingEvent, event);
        }
    };

    on<T>(t: EventType, handler: (e: StreamElementEvent) => Promise<T> | T) {
        this.eventEmitter.on(t, handler);
    }

    end() {
        this.eventEmitter.emit(POSTEVENT);
    }

    async registerPostEventHandler<T>(handler: () => Promise<T> | T) {
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
