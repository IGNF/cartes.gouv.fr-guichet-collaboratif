import { CustomControlItem } from "@/constants/communities/types";
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
                interaction: "select",
            },
            {
                id: 1,
                title: t("create_report"),
                target: "drawing-tool-point-",
                icon: "ri-map-pin-add-line",
                disabled: false,
                interaction: "create_report",
            },
            {
                id: 2,
                title: t("add_object"),
                target: currentCommunityLayer?.geoservice.featureType ?? "",
                icon: "ri-pen-nib-line",
                disabled: !community?.functionalities?.includes("draw"),
                interaction: "add",
            },
            {
                id: 3,
                title: t("cut_object"),
                target: "drawing-tool-edit-",
                icon: "ri-scissors-cut-line",
                disabled: !community?.functionalities?.includes("modify"),
                interaction: "modify",
            },
            {
                id: 4,
                title: t("delete_object"),
                target: "drawing-tool-remove-",
                icon: "ri-delete-bin-line",
                disabled: !community?.functionalities?.includes("delete"),
                interaction: "remove",
            },
            {
                id: 5,
                title: t("measure_distance"),
                target: "GPshowMeasureLengthPicto-",
                icon: "ri-ruler-line",
                disabled: !community?.functionalities?.includes("measureDistance"),
                interaction: null,
            },
        ];
    }, [community, currentCommunityLayer?.geoservice.featureType, t]);
    return constrolsList;
};

export default useCustomControlsList;
