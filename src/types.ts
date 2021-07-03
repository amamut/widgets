enum EventType {
    Cheer = "cheer",
    Tip = "tip",
    Subscriber = "subscriber"
}

enum EventCategory {
    CheerLatest = "cheer-latest",
    TipLatest = "tip-latest",
    SubscriberLatest = "subscriber-latest"
}

interface StreamElementCatalogItem {
    name: string;
    price: number;
    quantity: number;
}

interface StreamElementEvent {
    amount: number;
    count: number;
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

interface StreamElementObject {
    detail: {
        event: {
            event: StreamElementEvent;
        };
    };
}
