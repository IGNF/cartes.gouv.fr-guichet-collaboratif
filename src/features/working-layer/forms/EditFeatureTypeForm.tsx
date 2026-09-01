import { useEffect, useMemo, useCallback, memo } from "react";

import { EventTypes } from "ol/Observable";
import { useContributionStore, useMapStore } from "@/store";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";

import {
    FEATURE_TYPE_DATA_PROPERTY,
    FEATURE_TYPE_GEOSERVICE_PROPERTY,
    FEATURE_TYPE_NEW_PROPERTY,
    FEATURE_TYPE_PENDING_FORM_PROPERTY,
    FEATURE_TYPE_SELECTED_PROPERTY,
} from "@/constants";
import { FeatureTypeMode } from "@/constants/contributions/types";

import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { useFeatureTypeValidation } from "@/hooks/working-layer/useFeatureTypeValidation";
import { useFeatureTypeForm } from "@/hooks/working-layer/useFeatureTypeForm";
import { useFeatureTypeActions } from "@/hooks/working-layer/useFeatureTypeActions";
import { FeatureTypeFormHeader } from "./FeatureTypeFormHeader";
import { FeatureTypeFormFields } from "./FeatureTypeFormFields";
import { FeatureTypeFormActions } from "./FeatureTypeFormActions";
import { FeatureTypeFormAutomatic } from "./FeatureTypeFormAutomatic";
import { useFeatureFormGuard } from "@/hooks/working-layer/useFeatureFormGuard";
import { useTranslation } from "@/i18n";

interface PointDataProps {
    [key: string]: string | number | null;
}

const EditFeatureTypeForm = ({ onClose }: { onClose?: () => void }) => {
    const { map, mapSwitcher, clickedMapFeature, mapWorkingLayer, setClickedMapFeature, setWorkingLayerDrawerOpened } = useMapStore();
    const { selectedObjects, setSelectedObjects, setFeatureTypeMode, setColumnsToModify, setPendingFeatureFormValidator } = useContributionStore();

    const { t } = useTranslation({ EditFeatureTypeForm });
    const { guard } = useFeatureFormGuard();

    const pointData: PointDataProps = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
    const columns: FeatureTypeColumn[] = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY).columns || [], [clickedMapFeature]);
    const isNewFeature = useMemo(() => clickedMapFeature && clickedMapFeature?.get(FEATURE_TYPE_NEW_PROPERTY), [clickedMapFeature]);
    const hasPendingForm = clickedMapFeature?.get(FEATURE_TYPE_PENDING_FORM_PROPERTY) === true;

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

    const handleAutomaticFieldsCalculated = useCallback(
        (fields: Record<string, string | number | null>) => {
            Object.entries(fields).forEach(([name, value]) => {
                const col = columns.find((c) => c.name === name);
                if (col) {
                    updateField(name, value, col);
                }
            });
        },
        [columns, updateField]
    );

    const handleCancel = useCallback(() => {
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setColumnsToModify([]);
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [selectedObjects, setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode, setSelectedObjects, setColumnsToModify]);

    const handleSuccess = useCallback(() => {
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setColumnsToModify([]);
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [selectedObjects, setSelectedObjects, setColumnsToModify, setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const { handleSave, handleDelete, trySilentSave } = useFeatureTypeActions({
        clickedMapFeature,
        currentMapWorkingSource,
        clickableLayer,
        formData,
        columns,
        validateAll,
        onSuccess: handleSuccess,
    });

    const handleModeChange = useCallback(
        (newMode: FeatureTypeMode) => {
            if (newMode !== FeatureTypeMode.VIEW || !hasPendingForm) {
                setFeatureTypeMode(newMode);
                return;
            }

            guard(() => setFeatureTypeMode(newMode), undefined, "finish_before_view");
        },
        [guard, hasPendingForm, setFeatureTypeMode]
    );

    const handleLayerVisibility = useCallback(() => {
        if (clickableLayer && !clickableLayer.getVisible()) {
            handleCancel();
        }
    }, [clickableLayer, handleCancel]);

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

    // Before letting the user navigate away from his new object form without saving
    // We ensure that the form is valid (in terms of field constraints)
    useEffect(() => {
        if (!hasPendingForm) return;
        setPendingFeatureFormValidator(trySilentSave);
        return () => setPendingFeatureFormValidator(null);
    }, [hasPendingForm, trySilentSave, setPendingFeatureFormValidator]);

    const guardedClose = useCallback(() => {
        if (!hasPendingForm) {
            (onClose ?? handleCancel)();
            return;
        }
        guard(onClose ?? handleCancel, undefined, "finish_before_close");
    }, [guard, hasPendingForm, onClose, handleCancel]);

    if (!pointData) return null;

    return (
        <div className="feature-type-form-container">
            <FeatureTypeFormHeader
                title={`${isNewFeature ? t("state") + " " : ""}${geoserviceData?.title || ""}`}
                featureId={pointData?.[geoserviceData?.idName || "id"] || ""}
                mode={FeatureTypeMode.EDIT}
                onModeChange={handleModeChange}
                onClose={guardedClose}
            />
            <div className="feature-type-form-scrollable">
                <FeatureTypeFormAutomatic columns={columns} formData={formData} onAutomaticFieldsCalculated={handleAutomaticFieldsCalculated} />
                <FeatureTypeFormFields
                    columns={columns}
                    formData={formData}
                    validationErrors={validationErrors}
                    updateField={updateField}
                    idName={geoserviceData?.idName || "id"}
                />
            </div>

            <div className="feature-type-form-actions-fixed">
                <FeatureTypeFormActions onSave={() => handleSave()} onDelete={() => handleDelete()} onCancel={guardedClose} />
            </div>
        </div>
    );
};

export default memo(EditFeatureTypeForm);
