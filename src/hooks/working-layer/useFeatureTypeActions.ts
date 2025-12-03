import { useCallback } from "react";
import WKT from "ol/format/WKT";
import { Feature } from "ol";
import { deleteFeatureById, editFeatureById } from "@/api/featureTypesData";
import { FeatureTypeColumn, FeatureTypeIds } from "@/constants/communities/types";
import BaseLayer from "ol/layer/Base";

interface UseFeatureTypeActionsProps {
    clickedMapFeature: Feature | null;
    featureLayer: BaseLayer | null;
    pointData: Record<string, string | number | null>;
    formData: Record<string, string | number | boolean | File[] | null>;
    columns: FeatureTypeColumn[];
    validateAll: (columns: FeatureTypeColumn[], formData: Record<string, string | number | boolean | File[] | null>) => boolean;
    onSuccess: () => void;
}

export const useFeatureTypeActions = ({
    clickedMapFeature,
    featureLayer,
    pointData,
    formData,
    columns,
    validateAll,
    onSuccess,
}: UseFeatureTypeActionsProps) => {
    const handleSave = useCallback(async () => {
        try {
            if (!validateAll(columns, formData)) {
                console.error("Validation failed");
                return false;
            }

            const featureId = pointData?.id || pointData?.cleabs;
            if (!featureId) {
                console.error("No feature ID found");
                return false;
            }

            const database = featureLayer?.get("database");
            const table = featureLayer?.get("table");
            if (!database || !table) {
                console.error("Missing database or table");
                return false;
            }

            const featureTypesId: FeatureTypeIds = { database, table };

            const geometry = clickedMapFeature?.getGeometry();
            let wkt = "";

            if (geometry) {
                wkt = new WKT().writeGeometry(geometry.clone().transform("EPSG:3857", "EPSG:4326"));
            }

            const updated = await editFeatureById(
                featureTypesId,
                featureId,
                {
                    ...formData,
                    geometrie: wkt,
                },
                wkt
            );

            if (updated) {
                onSuccess();
                return true;
            } else {
                console.error("Save failed: update transaction failed");
                return false;
            }
        } catch (error) {
            console.error("Save failed:", error);
            return false;
        }
    }, [clickedMapFeature, featureLayer, pointData, formData, columns, validateAll, onSuccess]);

    const handleDelete = useCallback(async () => {
        try {
            const featureId = pointData?.id || pointData?.cleabs;
            if (!featureId) {
                console.error("No feature ID found");
                return false;
            }

            const database = featureLayer?.get("database");
            const table = featureLayer?.get("table");
            if (!database || !table) {
                console.error("Missing database or table");
                return false;
            }

            const featureTypesId: FeatureTypeIds = { database, table };

            const deleted = await deleteFeatureById(featureTypesId, featureId);

            if (deleted) {
                onSuccess();
                return true;
            } else {
                console.error("Delete failed: transaction failed");
                return false;
            }
        } catch (error) {
            console.error("Delete failed:", error);
            return false;
        }
    }, [featureLayer, pointData, onSuccess]);

    return {
        handleSave,
        handleDelete,
    };
};
