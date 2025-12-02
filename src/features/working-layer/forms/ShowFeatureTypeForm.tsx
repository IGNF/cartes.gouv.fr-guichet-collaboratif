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
    const { map, mapSwitcher, clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature, setFeatureTypeMode } = useMapStore();

    const { t } = useTranslation({ ShowFeatureTypeForm });

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get("featureTypeData"), [clickedMapFeature]);
    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get("geoservice"), [clickedMapFeature]);
    const featureLayer = useMemo(
        () =>
            geoserviceData &&
            map
                ?.getLayers()
                ?.getArray()
                .find((l) => l.get("name") === geoserviceData.layer),
        [map, geoserviceData]
    );

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
            clickedMapFeature.set("selected", true);
            clickedMapFeature.changed();
        }
        return () => {
            if (clickedMapFeature) {
                clickedMapFeature.unset("selected");
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

    const columns: FeatureTypeColumn[] = useMemo(() => clickedMapFeature?.get("geoservice").columns || [], [clickedMapFeature]);
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
        <>
            <div className="feature-type-form-header fr-flex fr-align-items--center">
                <h1 className="feature-type-form-title fr-text--lg">
                    {clickedMapFeature?.get("geoservice")?.title} : {pointData.id || pointData.cleabs}
                </h1>

                <Button
                    iconId="ri-edit-box-fill"
                    className="feature-type-form-edit-button fr-icon--lg"
                    priority="tertiary no outline"
                    aria-hidden="true"
                    onClick={() => {
                        setFeatureTypeMode("edit");
                    }}
                >
                    Éditer
                </Button>
            </div>

            <Table bordered fixed data={dataColumns} className="feature-type-form-table" />
        </>
    );
};

export default memo(ShowFeatureTypeForm);
