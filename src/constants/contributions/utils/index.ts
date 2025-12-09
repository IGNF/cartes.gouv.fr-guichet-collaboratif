import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_Z_COOD, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { CommunityGeoservice, ObjectProps } from "@/constants/communities/types";
import { getWebGLValidProperties } from "@/constants/communities/utils";
import { Feature, Map } from "ol";
import { Contribution, ContributionType } from "../types";
import { Interaction } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { CoordinateType, GeometryFeatueParams } from "@/constants/reports/types";
import { Coordinate } from "ol/coordinate";

export const addFeatureProperties = (feat: Feature, geoservice: CommunityGeoservice | undefined, contributions: Contribution[]) => {
    const featureTypeData: ObjectProps = {};
    geoservice?.columns.forEach((col) => {
        if (col.nullable || col.default_value) {
            featureTypeData[col.name] = col.default_value;
        } else {
            featureTypeData[col.name] = contributions.length + 1;
        }
    });
    featureTypeData[`${geoservice?.idName}`] = contributions.length + 1;
    const validProperties: ObjectProps = getWebGLValidProperties(featureTypeData);
    const properties = validProperties;
    properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice;
    properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
    properties["featureType"] = geoservice?.featureType;
    feat.setProperties(properties);
};

export const removeInteractionFromMap = (type: string | null, map: Map) => {
    if (!type) return;
    const mapInteractions = map?.getInteractions().getArray();
    mapInteractions.forEach((inter) => {
        if (inter.get("type") === type) {
            map?.removeInteraction(inter);
        }
    });
};

export const addInteractionToMap = (interaction: Interaction | null, map: Map) => {
    if (interaction) {
        const interExist = map
            ?.getInteractions()
            .getArray()
            .find((inter) => inter.get("type") === interaction.get("type"));
        if (!interExist) map?.addInteraction(interaction);
    }
};

export const resetContributionToMap = (map: Map, contr: Contribution) => {
    const featLayerSource = map
        ?.getAllLayers()
        .find((l) => l.get("name") === contr.layer)
        ?.getSource() as VectorSource;

    contr.feature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
    contr.initialFeature?.unset(FEATURE_TYPE_SELECTED_PROPERTY);

    if (featLayerSource) {
        switch (contr.type) {
            case ContributionType.CREATE:
                if (featLayerSource.hasFeature(contr.feature)) featLayerSource.removeFeature(contr.feature);
                break;
            case ContributionType.MODIFY:
                if (featLayerSource.hasFeature(contr.feature)) featLayerSource.removeFeature(contr.feature);
                if (!featLayerSource.hasFeature(contr.initialFeature)) featLayerSource.addFeature(contr.initialFeature);
                break;
            case ContributionType.DELETE:
                if (!featLayerSource.hasFeature(contr.initialFeature)) featLayerSource.addFeature(contr.initialFeature);
                break;
        }
    }
};

export const setFeatNewCoords = (feat: Feature) => {
    const geometry = feat.getGeometry() as GeometryFeatueParams;
    const featCoords = geometry?.getCoordinates() as CoordinateType;
    const getNewCoord = (coords: CoordinateType): CoordinateType => {
        if (Array.isArray(coords) && coords.length > 0) {
            return coords.map((coord) => {
                if (Array.isArray(coord) && Array.isArray(coord[0])) {
                    return getNewCoord(coord);
                } else if (Array.isArray(coord)) {
                    return [...(coord as number[]), FEATURE_TYPE_NEW_Z_COOD];
                }
                return coord;
            }) as CoordinateType;
        }
        return coords;
    };

    geometry?.setCoordinates(getNewCoord(featCoords));
};

export const isPointOnSegment = (A: Coordinate, B: Coordinate, P: Coordinate) => {
    const cross = (P[1] - A[1]) * (B[0] - A[0]) - (P[0] - A[0]) * (B[1] - A[1]);
    if (Math.abs(cross) > 1e-8) return false;

    const dot = (P[0] - A[0]) * (B[0] - A[0]) + (P[1] - A[1]) * (B[1] - A[1]);
    if (dot < 0) return false;

    const squaredLenAB = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
    if (dot > squaredLenAB) return false;

    return true;
};
