import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { jsonToHtmlList } from "@/constants/communities/utils";
import { useTranslation } from "@/i18n";
import { useContributionStore, useMapStore } from "@/store";
import Table from "@codegouvfr/react-dsfr/Table";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { FeatureTypeFormHeader } from "./FeatureTypeFormHeader";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { EventTypes } from "ol/Observable";
import { memo, useCallback, useEffect, useMemo } from "react";

interface PointDataProps {
    [key: string]: string | number | null;
}

const ShowFeatureTypeForm = () => {
    const { map, mapSwitcher, mapWorkingLayer, clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { setFeatureTypeMode } = useContributionStore();

    const { t } = useTranslation({ ShowFeatureTypeForm });

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY), [clickedMapFeature]);
    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY), [clickedMapFeature]);
    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));

    const isNewFeature = useMemo(() => clickedMapFeature && clickedMapFeature?.get(FEATURE_TYPE_NEW_PROPERTY), [clickedMapFeature]);

    const handleCancel = useCallback(() => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
    }, [setClickedMapFeature, setWorkingLayerDrawerOpened]);

    const handleModeChange = useCallback(
        (newMode: FeatureTypeMode) => {
            setFeatureTypeMode(newMode);
        },
        [setFeatureTypeMode]
    );

    const handleLayerVisibility = useCallback(() => {
        if (clickableLayer && !clickableLayer?.getVisible()) {
            handleCancel();
        }
    }, [clickableLayer, handleCancel]);

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

    useEffect(() => {
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);

        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        };
    }, [mapSwitcher, handleLayerVisibility]);

    const columns: FeatureTypeColumn[] = useMemo(() => geoserviceData?.columns || [], [geoserviceData]);
    const dataColumns = useMemo(
        () =>
            columns.map((col) => {
                const title = col.title;
                let value = pointData[col.name] || col.default_value;
                switch (value) {
                    case null:
                        value = t("value_empty");
                        break;
                    case false:
                        value = t("value_no");
                        break;
                    case true:
                        value = t("value_yes");
                        break;
                }
                if (col.crs) return [];
                try {
                    const json = JSON.parse(value as string);
                    value = jsonToHtmlList(json);
                } catch {
                    // Ignore JSON parse errors
                }
                return [
                    col.description ? (
                        <Tooltip kind="hover" title={<span>{col.description}</span>}>
                            <span>{title}</span>
                        </Tooltip>
                    ) : (
                        <span>{title}</span>
                    ),

                    <span className={typeof value === "string" && value.includes("vide") ? "feature-type-form-table_null_value" : ""}>{value ?? ""}</span>,
                ];
            }),
        [columns, pointData, t]
    );

    if (!pointData) return;

    return (
        <div className="feature-type-form-container">
            <FeatureTypeFormHeader
                title={`${isNewFeature ? t("state") + " " : ""}${geoserviceData?.title || ""}`}
                featureId={pointData?.[geoserviceData?.idName || "id"] || ""}
                mode={FeatureTypeMode.VIEW}
                onModeChange={handleModeChange}
                onClose={handleCancel}
            />

            <div className="feature-type-form-scrollable">
                <Table bordered fixed data={dataColumns} className="feature-type-form-table" />
            </div>
        </div>
    );
};

export default memo(ShowFeatureTypeForm);
