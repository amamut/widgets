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

export interface FieldData {
    backgroundColor: string;
    backgroundOpacity: number;
    direction: string;
    eventsLimit: number;
    fadeoutTime: number;
    fontColor: string;
    iconColor: string;
    includeCheers: string;
    includeFollowers: string;
    includeHosts: string;
    includeRaids: string;
    includeRedemptions: string;
    includeSubs: string;
    includeTips: string;
    locale: string;
    minCheer: number;
    minHost: number;
    minRaid: number;
    minTip: number;
    textOrder: string;
    theme: string;
    counterColor: string;
    startingAmount: number;
    fillCounter: number;
}

export interface StreamElementEventObject {
    event: {
        event: StreamElementEvent;
        listener: string;
    };
}

export interface StreamElementLoadingObject {
    channel: any;
    currency: any;
    fieldData: FieldData;
}
