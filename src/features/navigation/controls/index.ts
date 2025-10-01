import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import GeoportalFullScreen from "geopf-extensions-openlayers/src/packages/Controls/FullScreen/GeoportalFullScreen";
import { Collection } from "ol";
import CatalogControl from "./CatalogControl";
import useCenterViewToReportControl from "./useCenterViewToReportControl";
import { useTranslation } from "@/i18n";
import DrawingControl from "./DrawingControl";

const useGetMapControls = (): Collection<Control> | Control[] | undefined => {
    const drawControl = DrawingControl({});
    const catalogControl = CatalogControl({});
    const centerToReportControl = useCenterViewToReportControl();

    const { t } = useTranslation({ useGetMapControls });
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
        new GeoportalZoom({ position: "bottom-right", zoomInTipLabel: "Zoom In", zoomOutTipLabel: "Zoom Out" }),
        new GeoportalFullScreen({ position: "bottom-right", tipLabel: t("full_screen_label") }),
        catalogControl,
        centerToReportControl,
    ];
};

export default useGetMapControls;
