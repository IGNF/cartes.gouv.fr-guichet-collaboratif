import BaseEvent from "ol/events/Event";
import Feature from "ol/Feature";

// Class for custom events related to copy/paste inside context menu

export class CustomPasteEvent extends BaseEvent {
    coordinate?: number[];
    constructor(coordinate?: number[]) {
        super("custom-paste");
        this.coordinate = coordinate;
    }
}

export class CustomCopyEvent extends BaseEvent {
    feature?: Feature;
    constructor(feature?: Feature) {
        super("custom-copy");
        this.feature = feature;
    }
}
