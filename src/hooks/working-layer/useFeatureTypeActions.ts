import { useCallback } from "react";
import WKT from "ol/format/WKT";
import { Feature } from "ol";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { ContributionType } from "@/constants/contributions/types";
import { useContributionStore } from "@/store";
import { FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { FeatureTypeColumn } from "@/constants/communities/types";
import BaseLayer from "ol/layer/Base";

interface UseFeatureTypeActionsProps {
    clickedMapFeature: Feature | null;
    currentMapWorkingSource: VectorSource | null;
    clickableLayer: VectorLayer<VectorSource> | WebGLVectorLayer<VectorSource> | BaseLayer | undefined;
    pointData: Record<string, string | number | null>;
    formData: Record<string, string | number | boolean | File[] | null>;
    onSuccess: () => void;
    columns: FeatureTypeColumn[];
    validateAll: (columns: FeatureTypeColumn[], formData: Record<string, string | number | boolean | File[] | null>) => boolean;
}

export const useFeatureTypeActions = ({
    clickedMapFeature,
    clickableLayer,
    currentMapWorkingSource,
    pointData,
    formData,
    columns,
    validateAll,
    onSuccess,
}: UseFeatureTypeActionsProps) => {
    const { contributions, setContributions } = useContributionStore();

    const handleSave = useCallback(async () => {
        if (!clickedMapFeature) return false;

        if (!validateAll(columns, formData)) {
            console.error("Validation failed");
            return false;
        }

        const geometry = clickedMapFeature.getGeometry();
        if (geometry) {
            const wkt = new WKT().writeGeometry(geometry.clone().transform("EPSG:3857", "EPSG:4326"));
            clickedMapFeature.set("geometrie", wkt);
        }
        Object.entries(formData).forEach(([key, value]) => {
            clickedMapFeature.set(key, value);
        });

        const isNew = clickedMapFeature.get(FEATURE_TYPE_NEW_PROPERTY) === true;
        const type = isNew ? ContributionType.CREATE : ContributionType.MODIFY;

        const contrExist = contributions.find((c) => c.feature === clickedMapFeature);

        const newContr = {
            feature: clickedMapFeature,
            initialFeature: contrExist?.initialFeature ?? clickedMapFeature.clone(),
            layer: clickableLayer?.get("name"),
            type,
        };

        let newContributions = [...contributions];

        if (contrExist) {
            newContributions = newContributions.filter((c) => c.feature !== contrExist.feature);
        }
        newContributions.push(newContr);

        setContributions(newContributions);

        onSuccess();
        return true;
    }, [clickedMapFeature, clickableLayer, pointData, formData, validateAll, columns, contributions, setContributions, onSuccess]);

    const handleDelete = useCallback(() => {
        if (!clickedMapFeature) return false;

        if (currentMapWorkingSource) {
            currentMapWorkingSource.removeFeature(clickedMapFeature);
        }

        const contrExist = contributions.find((c) => c.feature === clickedMapFeature);

        const newContr = {
            feature: clickedMapFeature,
            initialFeature: contrExist?.initialFeature ?? clickedMapFeature.clone(),
            layer: clickableLayer?.get("name") ?? clickableLayer?.get("table"),
            type: ContributionType.DELETE,
        };

        let newContributions = [...contributions];

        if (contrExist?.type === ContributionType.CREATE) {
            newContributions = newContributions.filter((c) => c.feature !== contrExist.feature);
        } else {
            newContributions = newContributions.filter((c) => c.feature !== clickedMapFeature);
            newContributions.push(newContr);
        }

        setContributions(newContributions);
        onSuccess();
        return true;
    }, [clickedMapFeature, currentMapWorkingSource, clickableLayer, contributions, setContributions, onSuccess]);

    return {
        handleSave,
        handleDelete,
    };
};
