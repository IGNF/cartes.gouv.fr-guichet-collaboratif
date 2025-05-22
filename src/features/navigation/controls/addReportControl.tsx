import { ParamsReport } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";

const addReportControl = new Drawing({
    id: undefined,
    collapsed: true,
    position: "top-left",
    layerDescription: {
        title: "",
        description: "",
    },
    labels: {
        control: "Soumettre un signalement",
        points: "Créer un signalement",
        tooltip: "tooltip",
        display: "display",
        saveDescription: "Créer le signalement",
        setAsDefault: "setAsDefault",
        applyToObject: "applyToObject",
        strokeColor: "strokeColor",
        markerSize: "markerSize",
    },
    markersList: [
        {
            src: reportImgStatus.pending.img,
            anchor: [0.5, 1],
        },
    ],
    tools: {
        points: true,
        lines: true,
        polygons: true,
        holes: true,
        text: true,
        remove: true,
        display: true,
        tooltip: true,
        export: true,
        measure: true,
    },
    popup: {
        display: true,
        function: function (params: ParamsReport) {
            const container = document.createElement("div");
            const event = new CustomEvent("create-report-event", { detail: params });
            document.dispatchEvent(event);

            return container;
        },
    },
});

export default addReportControl;
