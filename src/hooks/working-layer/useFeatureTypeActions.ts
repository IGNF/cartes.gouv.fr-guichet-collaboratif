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
import { restoreFeature } from "@/constants/contributions/utils";
import { useContributionAuthorisation } from "./useContributionAuthorisation";

type FormData = Record<string, string | number | boolean | File[] | null>;

interface UseFeatureTypeActionsProps {
    clickedMapFeature: Feature | null;
    currentMapWorkingSource: VectorSource | null;
    clickableLayer: VectorLayer<VectorSource> | WebGLVectorLayer<VectorSource> | BaseLayer | undefined;
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
    const authoriseContribution = useContributionAuthorisation();

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

            if (!authoriseContribution(feat, type, initialFeat)) return false;
            saveContribution(feat, type, initialFeat, mapWorkingLayer);
            return true;
        },
        [authoriseContribution, mapWorkingLayer, saveContribution]
    );

    const saveFeature = useCallback(
        (feat: Feature, newFormData: FormData) => {
            const initialFeat = feat.clone();

            setFeatureData(feat, newFormData);

            if (!addFeatureToContributions(feat, initialFeat)) {
                restoreFeature(feat, initialFeat);
                return false;
            }
            return true;
        },
        [setFeatureData, addFeatureToContributions]
    );

    const deleteFeature = useCallback(
        (feat: Feature) => {
            const initialFeature = feat.clone();
            if (!authoriseContribution(feat, ContributionType.DELETE, initialFeature)) return false;

            saveContribution(feat, ContributionType.DELETE, initialFeature, mapWorkingLayer);
            if (currentMapWorkingSource) {
                currentMapWorkingSource.removeFeature(feat);
            }
            return true;
        },
        [authoriseContribution, currentMapWorkingSource, mapWorkingLayer, saveContribution]
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

            const hasSavedFeature = selectedObjects.map((feat) => saveFeature(feat, newFormData)).some(Boolean);
            if (!hasSavedFeature) return false;
        } else {
            if (!saveFeature(clickedMapFeature, formData)) return false;
        }

        onSuccess();
        return true;
    }, [clickedMapFeature, formData, columnsToModify, selectedObjects, validateAll, columns, onSuccess, saveFeature]);

    const handleDelete = useCallback(() => {
        if (!clickedMapFeature) return false;

        if (selectedObjects.length > 1) {
            const hasDeletedFeature = selectedObjects.map(deleteFeature).some(Boolean);
            if (!hasDeletedFeature) return false;
        } else {
            if (!deleteFeature(clickedMapFeature)) return false;
        }

        onSuccess();
        return true;
    }, [clickedMapFeature, selectedObjects, onSuccess, deleteFeature]);

    return {
        handleSave,
        handleDelete,
    };
};
