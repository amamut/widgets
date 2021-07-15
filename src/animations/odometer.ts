import { State } from "../state";

export function setOdometerColor(color: string) {
    $("#odometer").css("color", color);
}

export function setCounter() {
    console.log(State.fillCounter);
    $("#odometer").html(String(State.fillCounter));
}
