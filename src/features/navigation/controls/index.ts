import SearchEngineAdvanced from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngineAdvanced.js";
import CoordinateAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/CoordinateAdvancedSearch.js";
import { Control, ScaleLine } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MeasureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
import MeasureArea from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureArea";
import MeasureAzimuth from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureAzimuth";
import { Collection } from "ol";
import { useTranslation } from "@/i18n";
import { translateLayerSwitcherControl, translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";
import DrawingControl from "./DrawingControl";
import { useCommunityStore } from "@/store/useCommunityStore";
import { CommunityLayerFunctionalityType } from "@/constants/communities/types";

const useGetMapControls = (): Collection<Control> | Control[] | undefined => {
    const drawingControl = DrawingControl();
    const { t } = useTranslation({ useGetMapControls });
    const { community } = useCommunityStore();
    setTimeout(() => {
        translateLayerSwitcherControl(t);
        translateZoomControl(t);
        translateSearchEngineControl(t);
    }, 100);

    const advancedSearchForms = [];

    const hasCoordinateSearch =
        community?.functionalities?.includes(CommunityLayerFunctionalityType.SEARCH_LON_LAT) ||
        community?.functionalities?.includes(CommunityLayerFunctionalityType.SEARCH_LON_LAT_DEPRECIATED);

    if (hasCoordinateSearch) {
        advancedSearchForms.push(new CoordinateAdvancedSearch());
    }

    const hasAddressSearch =
        community?.functionalities?.includes(CommunityLayerFunctionalityType.ADRESSE) ||
        community?.functionalities?.includes(CommunityLayerFunctionalityType.ADRESSE_DEPRECIATED);

    return [
        new SearchEngineAdvanced({
            displayButtonAdvancedSearch: advancedSearchForms.length > 0,
            apiKey: "essentiels",
            zoomTo: "auto",
            placeholder: t("search_engine_placeholder"),
            historic: true,
            advancedSearch: advancedSearchForms.length > 0 ? advancedSearchForms : undefined,
            baseSearchOptions: {
                searchService: hasAddressSearch ? undefined : { autocomplete: false },
            },
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
