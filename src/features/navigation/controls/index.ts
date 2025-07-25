import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import GeoportalFullScreen from "geopf-extensions-openlayers/src/packages/Controls/FullScreen/GeoportalFullScreen";
import { catalogControl } from "./catalogControl";
import { Collection } from "ol";
import drawingControl from "./drawingControl";
import centerViewToReportControl from "./centerViewToReportControl";

const getMapControls = (): Collection<Control> | Control[] | undefined => {
    return [
        drawingControl,
        new SearchEngine({
            collapsed: true,
            displayAdvancedSearch: false,
            apiKey: "essentiels",
            zoomTo: "auto",
        }),
        new ScaleLine(),
        new GeoportalZoom({ position: "top-left" }),
        new GeoportalFullScreen({ position: "bottom-right" }),
        catalogControl,
        centerViewToReportControl,
    ];
};

export default getMapControls;
