import { ParamsReport } from "@/constants/reports/types";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";
import "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/DSFRdrawingStyle.css";
import { mainMarker, otherMarkers } from "@/constants/utils";
import { useTranslation } from "@/i18n";

const markersList = [mainMarker, ...otherMarkers];

const DrawingControl = () => {
    const { t } = useTranslation({ DrawingControl });
    const drawingControl = new Drawing({
        collapsed: true,
        layerDescription: {
            title: t("layer_title"),
            description: t("layer_description"),
        },
        tools: {
            points: true,
            lines: true,
            polygons: true,
            holes: false,
            text: true,
            remove: true,
            display: true,
            tooltip: true,
            export: false,
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
    drawingControl.options.markersList = markersList;
    return drawingControl;
};

export default DrawingControl;
