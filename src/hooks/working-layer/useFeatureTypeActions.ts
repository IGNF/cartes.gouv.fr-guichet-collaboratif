import { useCallback } from "react";
import WKT from "ol/format/WKT";
import { Feature } from "ol";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { ContributionType } from "@/constants/contributions/types";
import { useContributionStore, useMapStore } from "@/store";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { FeatureTypeColumn } from "@/constants/communities/types";
import BaseLayer from "ol/layer/Base";

type FormData = Record<string, string | number | boolean | File[] | null>;

interface UseFeatureTypeActionsProps {
    clickedMapFeature: Feature | null;
    currentMapWorkingSource: VectorSource | null;
    clickableLayer: VectorLayer<VectorSource> | WebGLVectorLayer<VectorSource> | BaseLayer | undefined;
    // pointData: Record<string, string | number | null>;
    formData: FormData;
    onSuccess: () => void;
    columns: FeatureTypeColumn[];
    validateAll: (columns: FeatureTypeColumn[], formData: FormData) => boolean;
}

export const useFeatureTypeActions = ({
    clickedMapFeature,
    currentMapWorkingSource,
    formData,
    columns,
    validateAll,
    onSuccess,
}: UseFeatureTypeActionsProps) => {
    const { mapWorkingLayer } = useMapStore();
    const { columnsToModify, selectedObjects, saveContribution } = useContributionStore();

    const setFeatureData = useCallback((feat: Feature, newFormData: FormData) => {
        const geometry = feat.getGeometry();
        if (geometry) {
            const wkt = new WKT().writeGeometry(geometry.clone().transform("EPSG:3857", "EPSG:4326"));
            feat.set("geometrie", wkt);
        }

        let featData = feat.get(FEATURE_TYPE_DATA_PROPERTY);
        featData = { ...featData, ...newFormData };
        feat.set(FEATURE_TYPE_DATA_PROPERTY, featData);

        Object.entries(newFormData).forEach(([key, value]) => {
            feat.set(key, value);
        });
        feat.changed();
    }, []);

    const addFeatureToContributions = useCallback(
        (feat: Feature, initialFeat: Feature) => {
            const isNew = feat.get(FEATURE_TYPE_NEW_PROPERTY) === true;
            const type = isNew ? ContributionType.CREATE : ContributionType.MODIFY;

            saveContribution(feat, type, initialFeat, mapWorkingLayer);
        },
        [mapWorkingLayer, saveContribution]
    );

    const saveFeature = useCallback(
        (feat: Feature, newFormData: FormData) => {
            const initialFeat = feat.clone();

            setFeatureData(feat, newFormData);

            addFeatureToContributions(feat, initialFeat);
        },
        [setFeatureData, addFeatureToContributions]
    );

    const deleteFeature = useCallback(
        (feat: Feature) => {
            if (currentMapWorkingSource) {
                currentMapWorkingSource.removeFeature(feat);
            }

            saveContribution(feat, ContributionType.DELETE, feat.clone(), mapWorkingLayer);
        },
        [currentMapWorkingSource, mapWorkingLayer, saveContribution]
    );

    const handleSave = useCallback(async () => {
        if (!clickedMapFeature) return false;

        if (!validateAll(columns, formData)) {
            console.error("Validation failed");
            return false;
        }

        if (selectedObjects.length > 1) {
            if (!columnsToModify.length) return;
            const newFormData: FormData = {};
            columnsToModify.forEach((col) => {
                newFormData[col.name] = formData[col.name];
            });

            selectedObjects.forEach((feat) => {
                saveFeature(feat, newFormData);
            });
        } else {
            saveFeature(clickedMapFeature, formData);
        }

        onSuccess();
        return true;
    }, [clickedMapFeature, formData, columnsToModify, selectedObjects, validateAll, columns, onSuccess, saveFeature]);

    const handleDelete = useCallback(() => {
        if (!clickedMapFeature) return false;

        if (selectedObjects.length > 1) {
            selectedObjects.forEach((feat) => {
                deleteFeature(feat);
            });
        } else {
            deleteFeature(clickedMapFeature);
        }

        onSuccess();
        return true;
    }, [clickedMapFeature, selectedObjects, onSuccess, deleteFeature]);

    return {
        handleSave,
        handleDelete,
    };
};
