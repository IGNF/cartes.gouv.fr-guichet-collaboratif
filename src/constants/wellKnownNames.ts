import { Style } from "ol/style";
import ImageStyle from "ol/style/Image";
import { FeatureTypeStyleItem } from "./communities/types";
import { getCircleStyle, getLineOrPolygonStyle, getRegularShapeStyle } from "./styles";

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
    const featureType = shapeProps.featureType;
    if (featureType === "line" || featureType === "polygon") {
        return getLineOrPolygonStyle(shapeProps);
    }
    if (type === "circle") {
        return getCircleStyle(shapeProps);
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
    return getRegularShapeStyle({ shapeProps, points, radius2, angle });
};

export const getShapeImage = (style: Style, shapeProps: FeatureTypeStyleItem, size: number = 32) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx?.translate(size / 2, size / 2);

    let shapeStyle = style;

    if (shapeProps.featureType === "polygon") {
        shapeStyle = getRegularShapeStyle({ shapeProps, points: 4, angle: Math.PI / 4, radius: 10 });
    } else if (shapeProps.featureType === "line") {
        shapeStyle = getRegularShapeStyle({ shapeProps, points: 2, angle: Math.PI / 2, radius: 10 });
    }

    const imageStyle = shapeStyle.getImage() as ImageStyle;

    if (imageStyle && "getImage" in imageStyle) {
        const imgEl = imageStyle.getImage(3);
        if (imgEl instanceof HTMLImageElement || imgEl instanceof HTMLCanvasElement) {
            ctx?.drawImage(imgEl, -size / 2, -size / 2, size, size);
        }
    }
    const img = document.createElement("img");
    img.src = canvas.toDataURL();
    img.width = shapeProps.pointRadius ?? 50;
    img.height = shapeProps.pointRadius ?? 50;
    return img;
};

export default function getWellKnownNames(shapeProps: FeatureTypeStyleItem) {
    const style = getShapeStyle(shapeProps);
    const image = getShapeImage(style, shapeProps);
    return [style, image];
}
