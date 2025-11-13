import { CommunityLayerFunctionalityType, CommunityLayerRoleType, CustomControlItem, InteractionType } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { ComponentKey } from "@/i18n/types";
import { useCommunityStore, useMapStore } from "@/store";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useMemo } from "react";

const useCustomControlsList = (t: TranslationFunction<"CustomControls", ComponentKey>): CustomControlItem[] => {
    const { mapWorkingLayer } = useMapStore();
    const { community, communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

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
                title: t("create_report"),
                target: "drawing-tool-point-",
                icon: "ri-map-pin-add-line",
                disabled: false,
                enabled: true,
                interaction: null,
            },
            {
                id: 2,
                title: t("add_object"),
                target: currentCommunityLayer?.geoservice.featureType ?? "",
                icon: "ri-pen-nib-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.DRAW),
                interaction: InteractionType.ADD_OBJECT,
            },
            {
                id: 3,
                title: t("cut_object"),
                target: "drawing-tool-edit-",
                icon: "ri-scissors-cut-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MODIFY),
                interaction: InteractionType.MODIFY,
            },
            {
                id: 4,
                title: t("delete_object"),
                target: "drawing-tool-remove-",
                icon: "ri-delete-bin-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.DELETE),
                interaction: InteractionType.REMOVE,
            },
            {
                id: 5,
                title: t("measure_distance"),
                target: "GPshowMeasureLengthPicto-",
                icon: "ri-ruler-line",
                disabled: currentCommunityLayer?.role === CommunityLayerRoleType.VISU || mapWorkingLayer === REPORTS_LAYER_TYPE,
                enabled: !!community?.functionalities?.includes(CommunityLayerFunctionalityType.MEASURE_DISTANCE),
                interaction: null,
            },
        ];
    }, [community, currentCommunityLayer?.geoservice.featureType, currentCommunityLayer?.role, mapWorkingLayer, t]);

    return constrolsList.filter((c) => c.enabled);
};

export default useCustomControlsList;
