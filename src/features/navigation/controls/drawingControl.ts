import { ParamsReport, toolNames } from "@/constants/reports/types";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";
import { mainMarker, otherMarkers } from "@/constants/utils";

const markersList = [mainMarker, ...otherMarkers];

const drawingControl = new Drawing({
    collapsed: true,
    position: "top-left",
    removable: true,
    layerDescription: {
        title: "Dessins",
        description: "Mes dessins",
    },
    labels: {
        control: "Soumettre un signalement",
    },
    markersList: markersList,
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

drawingControl.onShowDrawingClick = (e: Event) => {
    e.preventDefault();
    const button = e.target as HTMLElement;
    button.setAttribute("aria-pressed", "false");
    if (button.classList.contains("active")) {
        button.classList.remove("active");
    } else {
        button.classList.add("active");
    }
    const toolButton = document.querySelector(`button[id*="${toolNames.point}"]`) as HTMLButtonElement | null;
    if (toolButton) {
        toolButton.click();
    }
};

export default drawingControl;
