import SearchEngineAdvanced from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngineAdvanced.js";
import CoordinateAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/CoordinateAdvancedSearch.js";
import GeoportalOverviewMap from "geopf-extensions-openlayers/src/packages/Controls/OverviewMap/GeoportalOverviewMap.js";
import { Control } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MeasureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
import MeasureArea from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureArea";
import MeasureAzimuth from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureAzimuth";
import { useTranslation } from "@/i18n";
import { translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";
import { useCommunityStore } from "@/store/useCommunityStore";
import { CommunityLayerFunctionalityType } from "@/constants/communities/types";

const ToolsControl = (): Control[] => {
    const { t } = useTranslation({ ToolsControl });
    const { community } = useCommunityStore();

    setTimeout(() => {
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

    const hasMinimap = community?.functionalities?.includes(CommunityLayerFunctionalityType.OVERVIEW);

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
        new GeoportalZoom({ position: "bottom-right" }),
        ...(hasMinimap ? [new GeoportalOverviewMap({ position: "bottom-left", tipLabel: t("minimap") })] : []),
        new MeasureLength({}),
        new MeasureArea({}),
        new MeasureAzimuth({}),
    ];
};

export default ToolsControl;
