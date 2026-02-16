import {
    CommunityGeoservice,
    CommunityLayerFunctionalityType,
    CommunityLayerRoleType,
    CustomControlItem,
    GeoserviceFeatureTypeProp,
    InteractionType,
} from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { ComponentKey } from "@/i18n/types";
import { useCommunityStore, useMapStore } from "@/store";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useMemo } from "react";

const useCustomControlsList = (t: TranslationFunction<"CustomControls", ComponentKey>): CustomControlItem[] => {
    const { mapWorkingLayer, clickedMapFeature } = useMapStore();
    const { community, communityLayers } = useCommunityStore();

    const communityEditableLayers = useMemo(() => communityLayers?.filter((l) => l.role !== CommunityLayerRoleType.VISU), [communityLayers]);
    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l?.geoservice?.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    const geoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const queryableColumns = useMemo(() => geoservice?.columns.filter((col) => col.queryable), [geoservice]);

    const constrolsList: CustomControlItem[] = useMemo(() => {
        return [
            {
                id: 0,
                title: t("selector"),
                target: "drawing-tool-point-",
                icon: "ri-cursor-line",
                disabled: false,
                enabled: true,
                interaction: InteractionType.SELECT,
            },
            {
                id: 1,
                title: "Rechercher par attributs",
                target: "",
                icon: "ri-search-line",
                disabled: !currentCommunityLayer?.geoservice.featureType || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.SEARCH),
                interaction: InteractionType.SEARCH,
            },
            {
                id: 2,
                title: t("create_report"),
                target: "drawing-tool-point-",
                icon: "ri-map-pin-add-line",
                disabled: false,
                enabled: !!community?.themes?.length,
                interaction: null,
            },
            {
                id: 3,
                title: t("add_object"),
                target: currentCommunityLayer?.geoservice.featureType ?? "",
                icon: "ri-pen-nib-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.DRAW),
                interaction: InteractionType.ADD_OBJECT,
            },
            {
                id: 4,
                title: clickedMapFeature ? t("modify_object") : t("please_select_object"),
                target: "drawing-tool-edit-",
                icon: "ri-edit-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE || !clickedMapFeature,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MODIFY),
                interaction: InteractionType.MODIFY,
            },
            {
                id: 5,
                title: t("delete_object"),
                target: "drawing-tool-remove-",
                icon: "ri-delete-bin-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.DELETE),
                interaction: InteractionType.REMOVE,
            },
            {
                id: 6,
                title: t("measure_distance"),
                target: "GPshowMeasureLengthPicto-",
                icon: "ri-ruler-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled:
                    (!!community?.functionalities?.includes(CommunityLayerFunctionalityType.MEASURE_DISTANCE)) ||
                    !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MEASURE_DISTANCE_DEPRECIATED),
                interaction: null,
            },
            {
                id: 7,
                title: t("measure_area"),
                target: "GPshowMeasureAreaPicto-",
                icon: "ri-ruler-2-line",
                disabled: false,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MEASURE_AREA),
                interaction: null,
            },
            {
                id: 8,
                title: t("measure_azim"),
                target: "GPshowMeasureAzimuthPicto-",
                icon: "ri-compasses-2-fill",
                disabled: false,
                interaction: null,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MEASURE_AZIMUTH),
            },
            {
                id: 9,
                title: "Copier un objet",
                target: "",
                icon: "ri-file-copy-2-fill",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE || !clickedMapFeature,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.COPY_REF),
                interaction: InteractionType.COPY_OBJECT,
            },
            {
                id: 10,
                title: "Déplacer un objet",
                target: "",
                icon: "ri-drag-move-2-fill",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE || !clickedMapFeature,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.TRANSLATE),
                interaction: InteractionType.TRANSLATE_OBJECT,
            },
            {
                id: 11,
                title: t("cut_object"),
                target: "drawing-tool-edit-",
                icon: "ri-scissors-cut-line",
                disabled:
                    currentCommunityLayer?.role === CommunityLayerRoleType.VISU ||
                    mapWorkingLayer === REPORTS_LAYER_TYPE ||
                    currentCommunityLayer?.geoservice.featureType !== GeoserviceFeatureTypeProp.LINE,
                enabled: !!communityEditableLayers?.length && !!community?.functionalities?.includes(CommunityLayerFunctionalityType.SPLIT),
                interaction: InteractionType.SPLIT_LINE,
            },
        ];
    }, [
        community,
        currentCommunityLayer?.geoservice.featureType,
        queryableColumns,
        currentCommunityLayer?.role,
        mapWorkingLayer,
        communityEditableLayers,
        clickedMapFeature,
        t,
    ]);

    return constrolsList.filter((c) => c.enabled);
};

export default useCustomControlsList;
