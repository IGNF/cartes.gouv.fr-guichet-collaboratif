import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { getSelectedFeatureTypeStyle } from "@/constants/styles";
import { useTranslation } from "@/i18n";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { Style } from "ol/style";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

interface PointDataProps {
    [key: string]: string | number | null;
}

const ShowFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const lastMapFeatStyle = useRef<Style | null>(null);

    const { t } = useTranslation({ ShowFeatureTypeForm });

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get("featureTypeData"), [clickedMapFeature]);
    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get("geoservice"), [clickedMapFeature]);
    const featureLayer = useMemo(() => geoserviceData && map?.getAllLayers()?.find((l) => l.get("name") === geoserviceData.layer), [map, geoserviceData]);

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
            lastMapFeatStyle.current = clickedMapFeature.getStyle() as Style;
            clickedMapFeature.setStyle(getSelectedFeatureTypeStyle(geoserviceData?.featureType || "point", geoserviceData?.styles![0]));
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

    useEffect(() => {
        mapSwitcher?.on("layerswitcher:change:visibility", handleLayerVisibility);

        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility", handleLayerVisibility);
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
                return [
                    col.description ? (
                        <Tooltip kind="hover" title={<span dangerouslySetInnerHTML={{ __html: col.description }} />}>
                            <span>{title}</span>
                        </Tooltip>
                    ) : (
                        <span>{title}</span>
                    ),
                    <span className={typeof value === "string" && value.includes("vide") ? "feature-type-form-table_null_value" : ""}>{value}</span>,
                ];
            }),
        [columns, pointData, t]
    );

    if (!pointData) return;

    return (
        <>
            <h1 className="feature-type-form-title fr-mt-4v fr-mb-1v fr-text--lg">
                {clickedMapFeature?.get("geoservice")?.title} {pointData.id || pointData.cleabs}
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
