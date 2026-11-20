import { useCallback } from "react";
import { Feature } from "ol";

import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { computeAutomaticFields } from "@/constants/working-layer/utils";
import { useContributionStore, useMapStore, useUserStore } from "@/store";

/** The feature displayed in the edit form: its automatic fields are handled by the form itself. */
const isFeatureInEditForm = (feature: Feature) => {
    const { clickedMapFeature, workingLayerDrawerOpened } = useMapStore.getState();
    return workingLayerDrawerOpened && clickedMapFeature === feature && useContributionStore.getState().featureTypeMode !== FeatureTypeMode.VIEW;
};

/**
 * Recomputes the automatic fields of modified features and writes them in the feature data,
 * so that they are sent with the contribution.
 */
export const useRefreshAutomaticFields = () =>
    useCallback(
        async (features: Feature[], { skipFeatureInEditForm = true, onlyEmpty = false }: { skipFeatureInEditForm?: boolean; onlyEmpty?: boolean } = {}) => {
            const { user } = useUserStore.getState();
            const mapProjection = useMapStore.getState().map?.getView().getProjection().getCode();

            const { beginAutomaticComputation, endAutomaticComputation } = useContributionStore.getState();

            // The global save is blocked until the values are written in the features data
            beginAutomaticComputation();
            try {
                await Promise.all(
                    features.map(async (feature) => {
                        // Writing the data would reset the values being edited in the form
                        if (skipFeatureInEditForm && isFeatureInEditForm(feature)) return;

                        const geometry = feature.getGeometry();
                        const revision = geometry?.getRevision();
                        const values = await computeAutomaticFields(
                            feature,
                            {
                                userId: user?.id !== undefined ? String(user.id) : undefined,
                                username: user?.username,
                                mapProjection,
                            },
                            { onlyEmpty }
                        );

                        // The geometry changed (or the contribution was cancelled) during the computation: the values are outdated
                        if (feature.getGeometry() !== geometry || geometry?.getRevision() !== revision) return;
                        if (skipFeatureInEditForm && isFeatureInEditForm(feature)) return;
                        if (Object.keys(values).length === 0) return;

                        feature.setProperties({ ...values, [FEATURE_TYPE_DATA_PROPERTY]: { ...feature.get(FEATURE_TYPE_DATA_PROPERTY), ...values } });
                        feature.changed();
                    })
                );
            } finally {
                endAutomaticComputation();
            }
        },
        []
    );
