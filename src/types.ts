export enum EventType {
    Cheer = "cheer",
    Tip = "tip",
    Subscriber = "subscriber"
}

export enum EventCategory {
    CheerLatest = "cheer-latest",
    TipLatest = "tip-latest",
    SubscriberLatest = "subscriber-latest"
}

export interface StreamElementCatalogItem {
    name: string;
    price: number;
    quantity: number;
}

export interface StreamElementEvent {
    amount: number;
    count: number;
    gifted: boolean;
    bulkGifted: boolean;
    isTest: boolean;
    items: StreamElementCatalogItem[];
    message: string;
    month: string;
    name: string;
    originalEventName: EventCategory;
    sessionTop: boolean;
    tier: string;
    tts: boolean;
    type: EventType;
}

export interface StreamElementObject {
    detail: {
        event: {
            event: StreamElementEvent;
            listener: string;
        };
    };
}
