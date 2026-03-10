import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { useContributionStore } from "@/store/useContributionStore";
import { useCommunityStore } from "@/store";
import { useEffect, useMemo } from "react";
import { CommunityLayerRoleType } from "@/constants/communities/types";

interface FeatureTypeFormHeaderProps {
    title: string;
    featureId: string | number;
    mode: FeatureTypeMode;
    onModeChange: (mode: FeatureTypeMode) => void;
    onClose: () => void;
}

export const FeatureTypeFormHeader: React.FC<FeatureTypeFormHeaderProps> = ({ title, featureId, mode, onModeChange, onClose }) => {
    const { t } = useTranslation({ FeatureTypeFormHeader });

    const { featureTypeMode, selectedObjects } = useContributionStore();
    const { communityLayers } = useCommunityStore();

    const isVisuOnly = useMemo(() => {
        if (!title || !communityLayers) return false;

        const communityLayer = communityLayers.find((lr) => lr.geoservice.title === title);

        return communityLayer?.role === CommunityLayerRoleType.VISU;
    }, [communityLayers, title]);

    useEffect(() => {
        if (isVisuOnly && mode !== FeatureTypeMode.VIEW) {
            onModeChange(FeatureTypeMode.VIEW);
        }
    }, [isVisuOnly, mode, onModeChange]);

    const isEditMode = mode === FeatureTypeMode.EDIT;

    const isMultipleObjects = selectedObjects.length > 1;
    const featureIdDisplay = isMultipleObjects ? t("objects_count", { count: selectedObjects.length }) : featureId;

    return (
        <div className="feature-type-form-header">
            <h1 className="feature-type-form-title">
                {title} : {featureIdDisplay}
            </h1>
            {!isVisuOnly && (
                <Button
                    iconId={isEditMode ? "ri-eye-fill" : "ri-edit-box-fill"}
                    className="feature-type-form-edit-button"
                    priority="tertiary no outline"
                    onClick={() => onModeChange(isEditMode ? FeatureTypeMode.VIEW : FeatureTypeMode.EDIT)}
                >
                    {isEditMode ? t("back") : t("edit")}{" "}
                    {featureTypeMode === FeatureTypeMode.VIEW && isMultipleObjects ? t("objects_count", { count: selectedObjects.length }) : ""}
                </Button>
            )}
            <Button iconId="ri-close-line" className="drawer-close-button" priority="tertiary no outline" onClick={onClose} title={t("close")} />
        </div>
    );
};
