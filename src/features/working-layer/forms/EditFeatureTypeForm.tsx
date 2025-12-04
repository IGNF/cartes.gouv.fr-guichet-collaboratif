import { useEffect, useMemo, useCallback, memo, useRef } from "react";
import { EventTypes } from "ol/Observable";
import { useMapStore } from "@/store";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { useFeatureTypeValidation } from "@/hooks/working-layer/useFeatureTypeValidation";
import { useFeatureTypeForm } from "@/hooks/working-layer/useFeatureTypeForm";
import { useFeatureTypeActions } from "@/hooks/working-layer/useFeatureTypeActions";
import { FeatureTypeFormHeader } from "./FeatureTypeFormHeader";
import { FeatureTypeFormFields } from "./FeatureTypeFormFields";
import { FeatureTypeFormActions } from "./FeatureTypeFormActions";
import { featureTypeSelectedLineStyle, featureTypeSelectedPointCircleStyle, featureTypeSelectedPolygonStyle } from "@/constants/styles";
import { Style } from "ol/style";

interface PointDataProps {
    [key: string]: string | number | null;
}

const getSelectedFeatureTypeStyle = (type: string) => {
    if (type === "point") return featureTypeSelectedPointCircleStyle();
    if (type === "line") return featureTypeSelectedLineStyle();
    if (type === "polygon") return featureTypeSelectedPolygonStyle();
    return featureTypeSelectedPointCircleStyle();
};

const EditFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, setClickedMapFeature, setFeatureTypeMode, setWorkingLayerDrawerOpened } = useMapStore();

    const pointData: PointDataProps = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
    const lastMapFeatStyle = useRef<Style | null>(null);

    const columns: FeatureTypeColumn[] = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY).columns || [];
    const isNewFeature = useMemo(() => clickedMapFeature && clickedMapFeature?.get(FEATURE_TYPE_NEW_PROPERTY), [clickedMapFeature]);

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
            lastMapFeatStyle.current = clickedMapFeature.getStyle() as Style;
            clickedMapFeature.setStyle(getSelectedFeatureTypeStyle(geoserviceData?.featureType || "point"));
            clickedMapFeature.changed();
        }
        return () => {
            if (clickedMapFeature && lastMapFeatStyle.current) {
                clickedMapFeature.setStyle(lastMapFeatStyle.current);
                clickedMapFeature.changed();
                lastMapFeatStyle.current = null;
            }
        };
    }, [clickedMapFeature, geoserviceData, setWorkingLayerDrawerOpened]);
    if (!pointData) return null;

    return (
        <>
            <FeatureTypeFormHeader
                title={`${isNewFeature ? "Nouveau " : ""}${geoserviceData?.title} : ${pointData[geoserviceData?.idName ?? "id"]}`}
                onBack={handleBack}
                featureId={geoserviceData?.idName ?? "id"}
            />
            <FeatureTypeFormFields columns={columns} formData={formData} validationErrors={validationErrors} updateField={updateField} />

            <FeatureTypeFormActions onSave={handleSave} onDelete={handleDelete} onCancel={handleCancel} />
        </>
    );
};

export default memo(EditFeatureTypeForm);
