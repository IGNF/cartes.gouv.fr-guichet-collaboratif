import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { CommunityTheme, PointString } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import { PostThemeReport } from "./reports/types";

export const reportImgStatus = {
    submit: { img: imgSubmit, text: "Reçu dans nos services" },
    pending: { img: imgPending, text: "En cours de traitement" },
    valid: { img: imgValid, text: "Pris en compte" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)" },
    test: { img: imgTest, text: "En mode test" },
};

export const getLonLatFromPoint = (point: PointString | undefined) => {
    if (!point) return [];
    const lonLat = point.replace("POINT(", "").replace(")", "").split(" ").map(Number);
    return fromLonLat(lonLat);
};

export const getLonLatFromFeature = (feature: Feature | undefined) => {
    if (!feature) return;
    return feature
        .get("measure")
        .split("/")
        .map((str: string) => parseFloat(str.replace(/[^\d.-]/g, "")));
};

export const refreshReportLayer = (map: Map | null) => {
    if (!map) return;
    const mapCurrentLayers = map?.getAllLayers();
    const reportLayer = mapCurrentLayers?.find((l) => l.get("title") === "Signalements");
    if (reportLayer) {
        reportLayer.getSource()?.refresh();
    }
};

export const getThemeAttributes = (theme: CommunityTheme) => {
    return Array.isArray(theme?.attributes)
        ? theme?.attributes.reduce((acc: PostThemeReport, attribute) => {
              acc[attribute.name] = attribute.default;
              return acc;
          }, {})
        : theme?.attributes || {};
};
