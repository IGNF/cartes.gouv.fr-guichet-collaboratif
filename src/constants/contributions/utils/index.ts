import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { CommunityGeoservice, ObjectProps } from "@/constants/communities/types";
import { getValideProperties } from "@/constants/communities/utils";
import { Feature, Map } from "ol";
import { Contribution, ContributionType } from "../types";
import { Interaction } from "ol/interaction";
import VectorSource from "ol/source/Vector";

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

export const removeInteractionFromMap = (type: string | null, map: Map) => {
    if (!type) return;
    const controlInteraction = map
        ?.getInteractions()
        .getArray()
        .find((inter) => inter.get("type") === type);
    if (controlInteraction) {
        map?.removeInteraction(controlInteraction);
        return;
    }
};

export const addInteractionToMap = (interaction: Interaction | null, map: Map) => {
    if (interaction) {
        map?.addInteraction(interaction);
        return;
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
