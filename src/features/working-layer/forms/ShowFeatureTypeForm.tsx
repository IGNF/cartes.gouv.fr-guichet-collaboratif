import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { featureTypeSelectedLineStyle, featureTypeSelectedPointCircleStyle, featureTypeSelectedPolygonStyle } from "@/constants/styles";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { Style } from "ol/style";
import { useEffect, useRef } from "react";

interface PointDataProps {
    [key: string]: string | number | null;
}

const getSelectedFeatureTypeStyle = (type: string) => {
    if (type === "point") return featureTypeSelectedPointCircleStyle;
    if (type === "line") return featureTypeSelectedLineStyle;
    if (type === "polygon") return featureTypeSelectedPolygonStyle;
};

const ShowFeatureTypeForm = () => {
    const { clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const lastMapFeatStyle = useRef<Style | null>(null);
    const pointData: PointDataProps = clickedMapFeature?.get("featureTypeData");
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get("geoservice");
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

    const handleCancel = () => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
    };

    if (!pointData) return;

    const columns: FeatureTypeColumn[] = clickedMapFeature?.get("geoservice").columns || [];
    return (
        <>
            <h1 className="feature-type-form-title fr-mt-4v fr-mb-1v fr-text--lg">
                {clickedMapFeature?.get("geoservice")?.title} {pointData.id || pointData.cleabs}
            </h1>

            <Table
                bordered
                fixed
                data={columns.map((col) => {
                    if (col.crs) return [];
                    return [col.title, pointData[col.name] || col.default_value];
                })}
                className="feature-type-form-table"
            />

            <div className="feature-type-form-buttons">
                <Button priority="secondary" onClick={handleCancel}>
                    Annuler
                </Button>
            </div>
        </>
    );
};

export default ShowFeatureTypeForm;
