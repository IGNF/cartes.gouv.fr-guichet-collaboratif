import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { PointString } from "./communities/types";

export const reportImgStatus = {
    submit: imgSubmit,
    pending: imgPending,
    valid: imgValid,
    reject: imgReject,
    test: imgTest,
};

export const getLonLatFromPoint = (point: PointString | undefined) => {
    if (!point) return [];
    const lonLat = point.replace("POINT(", "").replace(")", "").split(" ").map(Number);
    return fromLonLat(lonLat);
};
