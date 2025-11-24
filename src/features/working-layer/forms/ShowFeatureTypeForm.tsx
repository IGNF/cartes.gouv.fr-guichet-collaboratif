import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { jsonToHtmlList } from "@/constants/communities/utils";
import { useTranslation } from "@/i18n";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { EventTypes } from "ol/Observable";
import { memo, useCallback, useEffect, useMemo } from "react";

interface PointDataProps {
    [key: string]: string | number | null;
}

const ShowFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();

    const { t } = useTranslation({ ShowFeatureTypeForm });

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY), [clickedMapFeature]);
    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY), [clickedMapFeature]);
    const featureLayer = useMemo(
        () =>
            geoserviceData &&
            map
                ?.getLayers()
                ?.getArray()
                .find((l) => l.get("name") === geoserviceData.layer),
        [map, geoserviceData]
    );

    const isNewFeature = useMemo(() => clickedMapFeature && clickedMapFeature?.get(FEATURE_TYPE_NEW_PROPERTY), [clickedMapFeature]);

    const handleCancel = useCallback(() => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
    }, [setClickedMapFeature, setWorkingLayerDrawerOpened]);

    const handleLayerVisibility = useCallback(() => {
        if (featureLayer && !featureLayer?.getVisible()) {
            handleCancel();
        }
    }, [featureLayer, handleCancel]);

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
    }, [clickedMapFeature, geoserviceData, featureLayer, setWorkingLayerDrawerOpened]);

    useEffect(() => {
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);

        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        };
    }, [mapSwitcher, handleLayerVisibility]);

    const columns: FeatureTypeColumn[] = useMemo(() => clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY).columns || [], [clickedMapFeature]);
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
                        <Tooltip kind="hover" title={<span dangerouslySetInnerHTML={{ __html: col.description }} />}>
                            <span>{title}</span>
                        </Tooltip>
                    ) : (
                        <span>{title}</span>
                    ),
                    <span
                        className={typeof value === "string" && value.includes("vide") ? "feature-type-form-table_null_value" : ""}
                        dangerouslySetInnerHTML={{ __html: value ?? "" }}
                    />,
                ];
            }),
        [columns, pointData, t]
    );

    if (!pointData) return;

    return (
        <>
            <h1 className="feature-type-form-title fr-mt-4v fr-mb-1v fr-text--lg">
                {isNewFeature ? "Nouveau" : ""} {clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.title} : {pointData.id || pointData.cleabs}
            </h1>

            <Table bordered fixed data={dataColumns} className="feature-type-form-table" />

            <div className="feature-type-form-buttons">
                <Button priority="secondary" onClick={handleCancel}>
                    {t("cancel")}
                </Button>
            </div>
        </>
    );
};

export default memo(ShowFeatureTypeForm);
