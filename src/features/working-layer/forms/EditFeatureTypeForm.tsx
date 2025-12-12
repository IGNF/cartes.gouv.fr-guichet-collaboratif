import { useEffect, useMemo, useCallback, memo, useState } from "react";

import { EventTypes } from "ol/Observable";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";

import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { FeatureTypeFormActionMode, FeatureTypeMode } from "@/constants/contributions/types";

import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { useFeatureTypeValidation } from "@/hooks/working-layer/useFeatureTypeValidation";
import { useFeatureTypeForm } from "@/hooks/working-layer/useFeatureTypeForm";
import { useFeatureTypeActions } from "@/hooks/working-layer/useFeatureTypeActions";
import { FeatureTypeFormHeader } from "./FeatureTypeFormHeader";
import { FeatureTypeFormFields } from "./FeatureTypeFormFields";
import { FeatureTypeFormActions } from "./FeatureTypeFormActions";
import { useTranslation } from "@/i18n";
import ConfirmMultipleObjectsActionModal from "./ConfirmMultipleObjectsActionModal";

interface PointDataProps {
    [key: string]: string | number | null;
}

const EditFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, mapWorkingLayer, setClickedMapFeature, setWorkingLayerDrawerOpened } = useMapStore();
    const { selectedObjects, setSelectedObjects, setFeatureTypeMode } = useContributionStore();
    const { confirmMultipleObjectsActionModal } = useModalStore();
    const [action, setAction] = useState<FeatureTypeFormActionMode>(FeatureTypeFormActionMode.CANCEL);

    const { t } = useTranslation({ EditFeatureTypeForm });

    const pointData: PointDataProps = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
    const columns: FeatureTypeColumn[] = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY).columns || [];
    const isNewFeature = useMemo(() => clickedMapFeature && clickedMapFeature?.get(FEATURE_TYPE_NEW_PROPERTY), [clickedMapFeature]);

    const currentMapWorkingSource = useMemo(
        () =>
            map
                ?.getAllLayers()
                .find((l) => l.get("name") === mapWorkingLayer)
                ?.getSource() as VectorSource,
        [map, mapWorkingLayer]
    );

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));

    const { validationErrors, setValidationErrors, validateField, validateAll } = useFeatureTypeValidation();

    const { formData, updateField } = useFeatureTypeForm(pointData, columns, validateField, setValidationErrors);

    const handleCancel = useCallback(() => {
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [selectedObjects, setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode, setSelectedObjects]);

    const handleSuccess = useCallback(() => {
        handleCancel();
    }, [handleCancel]);

    const { handleSave, handleDelete } = useFeatureTypeActions({
        clickedMapFeature,
        currentMapWorkingSource,
        clickableLayer,
        pointData,
        formData,
        columns,
        validateAll,
        onSuccess: handleSuccess,
    });

    const handleBack = useCallback(() => {
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [setFeatureTypeMode]);

    const handleLayerVisibility = useCallback(() => {
        if (clickableLayer && !clickableLayer.getVisible()) {
            handleCancel();
        }
    }, [clickableLayer, handleCancel]);

    const onConfirmModal = useCallback(() => {
        switch (action) {
            case FeatureTypeFormActionMode.CANCEL:
                handleCancel();
                return;
            case FeatureTypeFormActionMode.MODIFY:
                handleSave();
                return;
            case FeatureTypeFormActionMode.DELETE:
                handleDelete();
                return;
        }
    }, [action, handleCancel, handleDelete, handleSave]);

    useEffect(() => {
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        };
    }, [mapSwitcher, clickableLayer, handleCancel, handleLayerVisibility]);

    useEffect(() => {
        if (clickedMapFeature) {
            clickedMapFeature.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
            clickedMapFeature.changed();
        }
        return () => {
            if (clickedMapFeature) {
                clickedMapFeature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                clickedMapFeature.changed();
            }
        };
    }, [clickedMapFeature, geoserviceData, clickableLayer, setWorkingLayerDrawerOpened]);
    if (!pointData) return null;

    return (
        <>
            <div className="feature-type-form-container">
                <FeatureTypeFormHeader
                    title={`${isNewFeature ? t("state") + " " : ""}${geoserviceData?.title || ""}`}
                    featureId={pointData?.[geoserviceData?.idName || "id"] || ""}
                    onBack={handleBack}
                />
                <div className="feature-type-form-scrollable">
                    <FeatureTypeFormFields columns={columns} formData={formData} validationErrors={validationErrors} updateField={updateField} />
                </div>

                <div className="feature-type-form-actions-fixed">
                    <FeatureTypeFormActions
                        onSave={() => {
                            setAction(FeatureTypeFormActionMode.MODIFY);
                            confirmMultipleObjectsActionModal.open();
                        }}
                        onDelete={() => {
                            setAction(FeatureTypeFormActionMode.DELETE);
                            confirmMultipleObjectsActionModal.open();
                        }}
                        onCancel={() => {
                            setAction(FeatureTypeFormActionMode.CANCEL);
                            confirmMultipleObjectsActionModal.open();
                        }}
                    />
                </div>
            </div>
            <ConfirmMultipleObjectsActionModal action={action} onConfirm={onConfirmModal} />
        </>
    );
};

export default memo(EditFeatureTypeForm);
