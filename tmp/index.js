"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
require("./beer-fill.css");
const jquery_1 = __importDefault(require("jquery"));
const types_1 = require("../dist/types");
const events = [];
let loading = false;
let total = 0;
const MAXFILL = 80;
let currentFill = 0;
const subPercent = 1;
const cheerPercent = 1;
const tipPercent = 1;
let fillCounter = 0;
function normalizeTip(amount) {
    return amount;
}
function normalizeCheer(amount) {
    return amount / 100;
}
function normalizeSub() {
    return 5;
}
function isResub(data) {
    return data.count != 1;
}
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms, null));
}
function slideIn() {
    const glass = jquery_1.default(".glass");
    glass.animate(
        {
            opacity: 1,
            left: "300px"
        },
        1000
    );
    return glass.promise();
}
function slideOut() {
    return __awaiter(this, void 0, void 0, function* () {
        const glass = jquery_1.default(".glass");
        glass.animate({
            opacity: 0,
            left: "600px"
        });
        yield glass.promise();
        glass.css({
            left: 0
        });
        const beer = jquery_1.default(".beer");
        beer.css({
            height: 0,
            "border-width": 0
        });
        const foam = jquery_1.default(".foam");
        foam.css({
            top: 0,
            height: 0
        });
    });
}
function beerPour() {
    return __awaiter(this, void 0, void 0, function* () {
        const handle = jquery_1.default("#pipe-handle");
        handle.toggleClass("pull");
        const pipe = jquery_1.default("#pipe");
        pipe.toggleClass("flow");
        yield timeout(1000);
        yield beerFill();
        // Wait to finish pour
        yield timeout(3000);
        pipe.toggleClass("flow");
        handle.toggleClass("pull");
        return pipe.promise();
    });
}
function beerFill() {
    return __awaiter(this, void 0, void 0, function* () {
        const beer = jquery_1.default(".beer");
        const foam = jquery_1.default(".foam");
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
        yield beer.promise();
        foam.animate(
            {
                top: "-14px",
                height: "15px"
            },
            {
                start: function () {
                    foam.toggleClass("wave");
                },
                complete: function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield timeout(1000);
                        foam.toggleClass("wave");
                    });
                },
                queue: false
            }
        );
    });
}
function triggerAnimation() {
    return __awaiter(this, void 0, void 0, function* () {
        yield slideIn();
        yield beerPour();
    });
}
function resetFill() {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentFill >= MAXFILL) {
            total = 0;
            currentFill = 0;
            return Promise.resolve(yield slideOut());
        }
        return Promise.resolve();
    });
}
function setFill() {
    currentFill = (total / 100) * MAXFILL;
    if (currentFill >= MAXFILL) {
        currentFill = MAXFILL;
        fillCounter++;
        setCounter();
    }
    // console.log(`Current fill: ${currentFill}`);
}
function pushEvent(amount) {
    events.push({ amount });
}
function queueEvent(event) {
    // console.log(`QUEUING EVENT`, event);
    if (event) {
        let donation = null;
        switch (event.type) {
            case types_1.EventType.Subscriber:
                if (event.gifted) {
                    donation = normalizeSub() * subPercent;
                } else if (event.bulkGifted) {
                    donation = normalizeSub() * event.amount * subPercent;
                } else {
                    donation = !isResub(event) ? normalizeSub() * subPercent : 0;
                }
                break;
            case types_1.EventType.Tip:
                donation = normalizeTip(event.amount) * tipPercent;
                break;
            case types_1.EventType.Cheer:
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
        jquery_1.default("#odometer").html(String(fillCounter));
    }, 1000);
}
function init() {
    setCounter();
}
window.addEventListener("onEventReceived", (evt) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (!types_1.includeEvents.includes(evt.detail.listener)) {
            return;
        }
        console.log(evt);
        const event = evt.detail.event;
        // console.log("EVENT", event.event);
        queueEvent(event);
        if (!loading) {
            loading = true;
            let donation = events.shift();
            while (donation) {
                console.log(`Processing ${donation.amount}`);
                yield resetFill();
                total += donation.amount;
                setFill();
                yield triggerAnimation();
                donation = events.shift();
            }
            loading = false;
        }
    })
);
window.addEventListener("onWidgetLoad", (evt) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const data = evt.detail.fieldData;
        if (data.fillCounter) {
            fillCounter = data.fillCounter;
        }
        if (data.counterColor) {
            console.log(`Setting color ${data.counterColor}`);
            jquery_1.default("#odometer").css("color", data.counterColor);
        }
        if (data.startingAmount) {
            console.log(`Prefilling to ${data.startingAmount}`);
            total += data.startingAmount;
            setFill();
            yield triggerAnimation();
        }
    })
);
init();
//# sourceMappingURL=index.js.map
