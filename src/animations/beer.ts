import { State } from "../state";

function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms, null));
}

export function slideIn() {
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

export async function slideOut() {
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

export async function beerPour() {
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

export async function beerFill() {
    const beer = $(".beer");
    const foam = $(".foam");
    beer.animate(
        {
            height: `${State.currentFill}px`,
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
