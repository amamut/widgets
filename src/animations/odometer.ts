import { State } from "../state";

export function setOdometerColor(color: string) {
    $("#odometer").css("color", color);
}

export function setCounter() {
    $("#odometer").html(String(State.fillCounter));
}
