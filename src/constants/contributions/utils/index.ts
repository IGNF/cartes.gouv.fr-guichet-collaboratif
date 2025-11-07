import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice, ObjectProps } from "@/constants/communities/types";
import { getValideProperties } from "@/constants/communities/utils";
import { Feature } from "ol";
import { Contribution } from "../types";

export const addFeatureProperties = (feat: Feature, geoservice: CommunityGeoservice | undefined, contributions: Contribution[]) => {
    const featureTypeData: ObjectProps = {};
    geoservice?.columns.forEach((col) => {
        if (col.nullable || col.default_value) {
            featureTypeData[col.name] = col.default_value;
        } else {
            featureTypeData[col.name] = contributions.length + 1;
        }
    });
    const validProperties: ObjectProps = getValideProperties(featureTypeData);
    const properties = validProperties;
    properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice;
    properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
    properties["featureType"] = geoservice?.featureType;
    feat.setProperties(properties);
};
