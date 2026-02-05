import SearchEngineAdvanced from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngineAdvanced.js";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MesureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
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
        new SearchEngineAdvanced({
            collapsed: true,
            displayButtonAdvancedSearch: false,
            apiKey: "essentiels",
            zoomTo: "auto",
            placeholder: t("search_engine_placeholder"),
        }),
        new ScaleLine(),
        new GeoportalZoom({ position: "bottom-right" }),
        new MesureLength({}),
        drawingControl,
    ];
};

export default useGetMapControls;
