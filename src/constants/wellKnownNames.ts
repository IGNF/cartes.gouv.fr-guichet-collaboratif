import { Fill, RegularShape, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import ImageStyle from "ol/style/Image";
import { FeatureTypeStyleItem } from "./communities/types";

export const hexToRgba = (hex: string, opacity = 1) => {
    hex = hex.replace("#", "");

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getShapeStyle = (shapeProps: FeatureTypeStyleItem) => {
    const type = shapeProps.type;
    if (type === "circle") {
        return new Style({
            image: new CircleStyle({
                radius: shapeProps.pointRadius,
                fill: new Fill({
                    color: hexToRgba(shapeProps.fillColor, shapeProps.fillOpacity),
                }),
                stroke: new Stroke({
                    color: hexToRgba(shapeProps.strokeColor, shapeProps.strokeOpacity),
                    width: shapeProps.strokeWidth,
                }),
            }),
        });
    }
    let points = 5;
    let radius2: number | undefined = shapeProps.pointRadius / 2;
    let angle = 0;
    switch (type) {
        case "square":
            points = 4;
            radius2 = undefined;
            angle = Math.PI / 4;
            break;
        case "triangle":
            points = 3;
            break;
        case "cross":
            points = 4;
            radius2 = 0;
            break;
        case "x":
            points = 4;
            radius2 = 0;
            angle = Math.PI / 4;
            break;
    }
    return new Style({
        image: new RegularShape({
            points,
            radius: shapeProps.pointRadius,
            radius2,
            angle,
            fill: new Fill({
                color: hexToRgba(shapeProps.fillColor, shapeProps.fillOpacity),
            }),
            stroke: new Stroke({
                color: hexToRgba(shapeProps.strokeColor, shapeProps.strokeOpacity),
                width: shapeProps.strokeWidth,
            }),
        }),
    });
};

export const getShapeImage = (style: Style, shapeProps: FeatureTypeStyleItem, size: number = 32) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx?.translate(size / 2, size / 2);

    const imageStyle = style.getImage() as ImageStyle;

    if (imageStyle && "getImage" in imageStyle) {
        const imgEl = imageStyle.getImage(3);
        if (imgEl instanceof HTMLImageElement || imgEl instanceof HTMLCanvasElement) {
            ctx?.drawImage(imgEl, -size / 2, -size / 2, size, size);
        }
    }
    const img = document.createElement("img");
    img.src = canvas.toDataURL();
    img.width = shapeProps.pointRadius;
    img.height = shapeProps.pointRadius;
    return img;
};

export default function getWellKnownNames(shapeProps: FeatureTypeStyleItem) {
    const style = getShapeStyle(shapeProps);
    const image = getShapeImage(style, shapeProps);
    return [style, image];
}
