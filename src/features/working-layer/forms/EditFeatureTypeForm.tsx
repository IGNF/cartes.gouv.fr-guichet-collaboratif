import { useEffect, useMemo, useCallback, memo } from "react";
import { EventTypes } from "ol/Observable";
import { useMapStore } from "@/store";
import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { useFeatureTypeValidation } from "@/hooks/working-layer/useFeatureTypeValidation";
import { useFeatureTypeForm } from "@/hooks/working-layer/useFeatureTypeForm";
import { useFeatureTypeActions } from "@/hooks/working-layer/useFeatureTypeActions";
import { FeatureTypeFormHeader } from "./FeatureTypeFormHeader";
import { FeatureTypeFormFields } from "./FeatureTypeFormFields";
import { FeatureTypeFormActions } from "./FeatureTypeFormActions";

const EditFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, setClickedMapFeature, setFeatureTypeMode, setWorkingLayerDrawerOpened } = useMapStore();

    const pointData = useMemo(() => clickedMapFeature?.get("featureTypeData"), [clickedMapFeature]);
    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get("geoservice"), [clickedMapFeature]);
    const columns: FeatureTypeColumn[] = useMemo(() => geoserviceData?.columns ?? [], [geoserviceData]);

    const featureLayer = useMemo(() => {
        if (!map || !geoserviceData) return null;

        return (
            map
                .getLayers()
                .getArray()
                .find((l) => l.get("name") === geoserviceData.layer) ?? null
        );
    }, [map, geoserviceData]);

    const { validationErrors, setValidationErrors, validateField, validateAll } = useFeatureTypeValidation();

    const { formData, updateField } = useFeatureTypeForm(pointData, columns, validateField, setValidationErrors);

    const handleSuccess = useCallback(() => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode("view");
    }, [setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const { handleSave, handleDelete } = useFeatureTypeActions({
        clickedMapFeature,
        featureLayer,
        pointData,
        formData,
        columns,
        validateAll,
        onSuccess: handleSuccess,
    });

    const handleCancel = useCallback(() => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode("view");
    }, [setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const handleBack = useCallback(() => {
        setFeatureTypeMode("view");
    }, [setFeatureTypeMode]);

    useEffect(() => {
        const handleLayerVisibility = () => {
            if (featureLayer && !featureLayer?.getVisible()) {
                handleCancel();
            }
        };

        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        };
    }, [mapSwitcher, featureLayer, handleCancel]);

    useEffect(() => {
        if (clickedMapFeature) {
            clickedMapFeature.set("selected", true);
            clickedMapFeature.changed();
        }
        return () => {
            if (clickedMapFeature) {
                clickedMapFeature.unset("selected");
                clickedMapFeature.changed();
            }
        };
    }, [clickedMapFeature]);

    if (!pointData) return null;

    return (
        <>
            <FeatureTypeFormHeader title={geoserviceData?.title} featureId={pointData.id || pointData.cleabs} onBack={handleBack} />

            <FeatureTypeFormFields columns={columns} formData={formData} validationErrors={validationErrors} updateField={updateField} />

            <FeatureTypeFormActions onSave={handleSave} onDelete={handleDelete} onCancel={handleCancel} />
        </>
    );
};

export default memo(EditFeatureTypeForm);
