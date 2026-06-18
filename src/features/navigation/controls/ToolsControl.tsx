import CoordinateAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/CoordinateAdvancedSearch.js";
import GeoportalOverviewMap from "geopf-extensions-openlayers/src/packages/Controls/OverviewMap/GeoportalOverviewMap.js";
import { Feature } from "ol";
import { Control } from "ol/control";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import MeasureLength from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureLength";
import MeasureArea from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureArea";
import MeasureAzimuth from "geopf-extensions-openlayers/src/packages/Controls/Measures/MeasureAzimuth";
import ContextMenu from "geopf-extensions-openlayers/src/packages/Controls/ContextMenu/ContextMenu.js";

import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "@/i18n";
import { translateSearchEngineControl, translateZoomControl } from "@/constants/communities/utils";
import { useCommunityStore, useContributionStore, useMapStore } from "@/store";
import { CommunityLayerFunctionalityType, InteractionType } from "@/constants/communities/types";
import { CustomPasteEvent, CustomCopyEvent } from "@/classes/CustomControl";
import useGetOverviewMapLayer from "@/hooks/navigation/layers/useGetOverviewMapLayer";
import NamedPositionSearchEngineControl from "@/features/navigation/controls/GuichetSearchEngineControl";
import AbstractAdvancedSearch from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/AbstractAdvancedSearch";
import useCustomControlsList from "@/hooks/navigation/controls/useCustomControlsList";

const useToolsControl = (): Control[] => {
    const { t } = useTranslation({ ToolsControl: {} });
    const { t: tCustomControls } = useTranslation({ CustomControls: {} });
    const { community } = useCommunityStore();
    const { map, clickedMapFeature, clickedControl, setClickedControl } = useMapStore();
    const { selectedObjects } = useContributionStore();
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

    const namedPositionTexts = {
        openModalButton: t("open_button"),
        favoritesTitle: t("favorites_title"),
        emptyFavorites: t("empty_favorites"),
        removeFavorite: t("remove_favorite"),
        modalTitle: t("modal_title"),
        positionNameLabel: t("name_label"),
        sourceLabel: t("source_label"),
        sourceSelectedResult: t("source_selected_result"),
        sourceMapCenter: t("source_map_center"),
        sourceManualCoordinates: t("source_manual_coordinates"),
        longitudeLabel: t("longitude_label"),
        latitudeLabel: t("latitude_label"),
        saveButton: t("save_button"),
        cancelButton: t("cancel_button"),
        defaultPositionName: t("default_name"),
        selectedResultUnavailable: t("error_selected_result_unavailable"),
        errorEmptyName: t("error_empty_name"),
        errorInvalidCoordinates: t("error_invalid_coordinates"),
        errorDuplicateName: t("error_duplicate_name"),
    };

    const controlsList = useCustomControlsList(tCustomControls);
    const copyControl = useMemo(() => controlsList.find((control) => control.interaction === InteractionType.COPY_OBJECT), [controlsList]);

    const contextMenuItemsOptions = useMemo(() => {
        // Don't show if control is disabled in community functionalities or not found
        if (!copyControl || copyControl.disabled) return [];

        const isPasteMode = clickedControl?.interaction === InteractionType.COPY_OBJECT;

        // In copy mode: only show if there is a feature selected
        // In paste mode: always show
        if (!isPasteMode && !clickedMapFeature && selectedObjects.length === 0) {
            return [];
        }

        return [
            {
                text: isPasteMode ? tCustomControls("paste_object") : copyControl.title,
                callback: (payload: { coordinate?: number[] }) => {
                    // Each time why the map to pass event and so copyfeature or coordinates
                    if (isPasteMode) {
                        if (!map || !payload?.coordinate) return;
                        map.dispatchEvent(new CustomPasteEvent(payload.coordinate));
                        return;
                    }

                    const feature = (selectedObjects[0] ?? clickedMapFeature) as Feature | undefined;
                    if (!feature || !map) return;

                    setClickedControl(copyControl);
                    map.dispatchEvent(new CustomCopyEvent(feature));
                },
            },
        ];
    }, [copyControl, clickedControl, clickedMapFeature, selectedObjects, map, setClickedControl, tCustomControls]);

    const contextMenu = useMemo(
        () =>
            new ContextMenu({
                auto: true,
                contextMenuItemsOptions: [],
            }),
        []
    );

    useEffect(() => {
        contextMenu.updateContextMenuItems?.(contextMenuItemsOptions);
    }, [contextMenu, contextMenuItemsOptions]);

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
        new NamedPositionSearchEngineControl({
            displayButtonAdvancedSearch: advancedSearchForms.length > 0,
            apiKey: "essentiels",
            zoomTo: "auto",
            placeholder: t("search_engine_placeholder"),
            historic: true,
            advancedSearch: advancedSearchForms.length > 0 ? advancedSearchForms : undefined,
            baseSearchOptions: {
                searchService: hasAddressSearch ? undefined : { autocomplete: false },
            },
            namedPositionTexts,
        }),
        new GeoportalZoom({ position: "bottom-right" }),
        new MeasureLength({}),
        new MeasureArea({}),
        new MeasureAzimuth({}),
        contextMenu as unknown as Control,
    ];
};

export default useToolsControl;
