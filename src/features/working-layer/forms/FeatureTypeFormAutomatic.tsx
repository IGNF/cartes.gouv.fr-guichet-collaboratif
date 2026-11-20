import { useMemo, useEffect, useRef, useState } from "react";
import { FeatureTypeColumn } from "@/constants/communities/types";
import { ContributionType } from "@/constants/contributions/types";
import { useUserStore, useMapStore, useContributionStore } from "@/store";
import { computeAutomaticFields, getAutomaticColumns } from "@/constants/working-layer/utils";
import { useRefreshAutomaticFields } from "@/hooks/working-layer/useRefreshAutomaticFields";
import { useTranslation } from "@/i18n";

const GEOMETRY_CHANGE_DEBOUNCE_MS = 300;

interface FeatureTypeFormAutomaticProps {
    columns: FeatureTypeColumn[];
    onAutomaticFieldsCalculated?: (fields: Record<string, string | number>) => void;
    onCalculatingChange?: (isCalculating: boolean) => void;
}

/**
 * Computes the values of automatic columns (keyword in `formula`) and reports them to the form,
 * when the feature is opened and each time its geometry changes.
 * The values are displayed by the form fields, where automatic columns are read-only.
 */
export const FeatureTypeFormAutomatic: React.FC<FeatureTypeFormAutomaticProps> = ({ columns, onAutomaticFieldsCalculated, onCalculatingChange }) => {
    const { t } = useTranslation({ FeatureTypeFormAutomatic });
    const { user } = useUserStore();
    const { clickedMapFeature, map } = useMapStore();
    const refreshAutomaticFields = useRefreshAutomaticFields();
    const [isCalculating, setIsCalculating] = useState(false);
    const userId = user?.id;
    const username = user?.username;
    const mapProjection = map?.getView().getProjection().getCode();

    const callbackRef = useRef(onAutomaticFieldsCalculated);
    const calculatingCallbackRef = useRef(onCalculatingChange);
    useEffect(() => {
        callbackRef.current = onAutomaticFieldsCalculated;
        calculatingCallbackRef.current = onCalculatingChange;
    }, [onAutomaticFieldsCalculated, onCalculatingChange]);

    useEffect(() => {
        calculatingCallbackRef.current?.(isCalculating);
        if (!isCalculating) return;
        // The global save is blocked until the values are reported to the form
        const { beginAutomaticComputation, endAutomaticComputation } = useContributionStore.getState();
        beginAutomaticComputation();
        return endAutomaticComputation;
    }, [isCalculating]);

    const hasAutomaticColumns = useMemo(() => getAutomaticColumns(columns).length > 0, [columns]);

    useEffect(() => {
        if (!clickedMapFeature || !hasAutomaticColumns) return;

        const feature = clickedMapFeature;
        let run = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let geometry = feature.getGeometry();
        let revision = geometry?.getRevision();

        const calculateFields = async () => {
            const currentRun = ++run;
            setIsCalculating(true);
            const values = await computeAutomaticFields(feature, {
                userId: userId !== undefined ? String(userId) : undefined,
                username,
                mapProjection,
            });
            if (currentRun !== run) return;
            setIsCalculating(false);
            callbackRef.current?.(values);
        };

        // The feature "change" event is also fired by the geometry changes
        const handleFeatureChange = () => {
            const currentGeometry = feature.getGeometry();
            if (currentGeometry === geometry && currentGeometry?.getRevision() === revision) return;
            geometry = currentGeometry;
            revision = currentGeometry?.getRevision();
            // Invalidates the computation in progress and blocks the save until the new values are computed
            run++;
            setIsCalculating(true);
            clearTimeout(timer);
            timer = setTimeout(() => void calculateFields(), GEOMETRY_CHANGE_DEBOUNCE_MS);
        };

        void calculateFields();
        feature.on("change", handleFeatureChange);

        return () => {
            run++;
            clearTimeout(timer);
            feature.un("change", handleFeatureChange);
            setIsCalculating(false);
        };
    }, [clickedMapFeature, hasAutomaticColumns, userId, username, mapProjection]);

    // When leaving a modified feature, its automatic fields are written in its data, even if the form was not saved
    // (e.g. its geometry was modified while the form was opened)
    useEffect(() => {
        if (!clickedMapFeature || !hasAutomaticColumns) return;
        return () => {
            const isModified = useContributionStore
                .getState()
                .contributions.some((contr) => contr.feature === clickedMapFeature && contr.type !== ContributionType.DELETE);
            if (isModified) void refreshAutomaticFields([clickedMapFeature], { skipFeatureInEditForm: false });
        };
    }, [clickedMapFeature, hasAutomaticColumns, refreshAutomaticFields]);

    if (!isCalculating) return null;

    return (
        <p className="fr-text--sm fr-mb-2w" role="status">
            {t("wait")}
        </p>
    );
};
