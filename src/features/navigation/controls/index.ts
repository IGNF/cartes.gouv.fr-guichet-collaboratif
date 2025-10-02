import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import GeoportalFullScreen from "geopf-extensions-openlayers/src/packages/Controls/FullScreen/GeoportalFullScreen";
import { Collection } from "ol";
import useCenterViewToReportControl from "./useCenterViewToReportControl";
import { useTranslation } from "@/i18n";
import DrawingControl from "./DrawingControl";
import { translateLayerSwitcherControl, translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";

const useGetMapControls = (): Collection<Control> | Control[] | undefined => {
    const drawControl = DrawingControl({});
    const centerToReportControl = useCenterViewToReportControl();

    const { t } = useTranslation({ useGetMapControls });

    setTimeout(() => {
        translateLayerSwitcherControl(t);
        translateZoomControl(t);
        translateSearchEngineControl(t);
    }, 100);

    return [
        drawControl,
        new SearchEngine({
            collapsed: true,
            displayAdvancedSearch: false,
            apiKey: "essentiels",
            zoomTo: "auto",
            placeholder: t("search_engine_placeholder"),
        }),
        new ScaleLine(),
        new GeoportalZoom({ position: "top-left" }),
        new GeoportalFullScreen({ position: "bottom-right", tipLabel: t("full_screen_label") }),
        centerToReportControl,
    ];
};

export default useGetMapControls;
