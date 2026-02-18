import SearchEngineAdvanced from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngineAdvanced.js";
import CoordinateAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/CoordinateAdvancedSearch.js";
import GeoportalOverviewMap from "geopf-extensions-openlayers/src/packages/Controls/OverviewMap/GeoportalOverviewMap.js";
import { Control } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MeasureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
import MeasureArea from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureArea";
import MeasureAzimuth from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureAzimuth";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/i18n";
import { translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";
import { useCommunityStore, useMapStore } from "@/store";
import { CommunityLayerFunctionalityType } from "@/constants/communities/types";
import useGetOverviewMapLayer from "@/hooks/navigation/layers/useGetOverviewMapLayer";
import AbstractAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/AbstractAdvancedSearch";

const useToolsControl = (): Control[] => {
    const { t } = useTranslation({ ToolsControl: {} });
    const { community } = useCommunityStore();
    const { map } = useMapStore();
    const overviewMapLayer = useGetOverviewMapLayer();
    const overviewMapControlRef = useRef<GeoportalOverviewMap | null>(null);

    useEffect(() => {
        translateZoomControl(t);
        translateSearchEngineControl(t);
    }, [t]);

    const advancedSearchForms: AbstractAdvancedSearch[] = [];

    const hasCoordinateSearch =
        community?.functionalities?.includes(CommunityLayerFunctionalityType.SEARCH_LON_LAT) ||
        community?.functionalities?.includes(CommunityLayerFunctionalityType.SEARCH_LON_LAT_DEPRECIATED);
    if (hasCoordinateSearch) {
        advancedSearchForms.push(new CoordinateAdvancedSearch());
    }

    const hasAddressSearch =
        community?.functionalities?.includes(CommunityLayerFunctionalityType.ADRESSE) ||
        community?.functionalities?.includes(CommunityLayerFunctionalityType.ADRESSE_DEPRECIATED);

    const hasMiniMap = community?.functionalities?.includes(CommunityLayerFunctionalityType.OVERVIEW);

    // const hasLocateControl = community?.functionalities?.includes(CommunityLayerFunctionalityType.LOCATE_CONTROL);

    useEffect(() => {
        if (!hasMiniMap || !overviewMapLayer || !map) {
            return;
        }

        if (!overviewMapControlRef.current) {
            const overviewMapControl = new GeoportalOverviewMap({
                position: "bottom-left",
                layers: [overviewMapLayer],
            });

            overviewMapControlRef.current = overviewMapControl;
            map.addControl(overviewMapControl);
        }

        return () => {
            if (overviewMapControlRef.current && map) {
                map.removeControl(overviewMapControlRef.current);
                overviewMapControlRef.current = null;
            }
        };
    }, [hasMiniMap, overviewMapLayer, map]);

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
        new MeasureLength({}),
        new MeasureArea({}),
        new MeasureAzimuth({}),
    ];
};

export default useToolsControl;
