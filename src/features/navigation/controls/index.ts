import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MeasureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
import MeasureArea from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureArea";
import MeasureAzimuth from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureAzimuth";
import { Collection } from "ol";
import { useTranslation } from "@/i18n";
import { translateLayerSwitcherControl, translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";
import DrawingControl from "./DrawingControl";

const useGetMapControls = (): Collection<Control> | Control[] | undefined => {
    const drawingControl = DrawingControl();
    const { t } = useTranslation({ useGetMapControls });

    setTimeout(() => {
        translateLayerSwitcherControl(t);
        translateZoomControl(t);
        translateSearchEngineControl(t);
    }, 100);

    return [
        new SearchEngine({
            collapsed: true,
            displayButtonAdvancedSearch: false,
            apiKey: "essentiels",
            zoomTo: "auto",
            placeholder: t("search_engine_placeholder"),
        }),
        new ScaleLine(),
        new GeoportalZoom({ position: "bottom-right" }),
        new MeasureLength({}),
        new MeasureArea({}),
        new MeasureAzimuth({}),
        drawingControl,
    ];
};

export default useGetMapControls;
