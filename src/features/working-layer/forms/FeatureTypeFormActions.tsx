import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";
import { useMemo } from "react";
import { useContributionStore } from "@/store";
import { FeatureTypeMode } from "@/constants/contributions/types";

interface FeatureTypeFormActionsProps {
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export const FeatureTypeFormActions: React.FC<FeatureTypeFormActionsProps> = ({ onSave, onDelete, onCancel }) => {
    const { selectedObjects, featureTypeMode, columnsToModify } = useContributionStore();
    const { t } = useTranslation({ FeatureTypeFormActions });

    const selectedObjectsText = useMemo(
        () => (featureTypeMode === FeatureTypeMode.EDIT && selectedObjects.length > 1 ? `les ${selectedObjects.length} objets` : ""),
        [featureTypeMode, selectedObjects]
    );

    const disableSave = selectedObjects.length > 1 && !columnsToModify.length;

    return (
        <div className="feature-type-form-buttons">
            <div className="feature-type-form-actions-left">
                <Button
                    onClick={onDelete}
                    priority="primary"
                    size={selectedObjects.length > 1 ? "small" : "medium"}
                    iconId="ri-delete-bin-line"
                    iconPosition="right"
                >
                    {t("delete")} {selectedObjectsText}
                </Button>
            </div>

            <div className="feature-type-form-actions-right">
                <Button priority="secondary" onClick={onCancel}>
                    {t("cancel")}
                </Button>

                <Button
                    priority="primary"
                    size={selectedObjects.length > 1 ? "small" : "medium"}
                    onClick={onSave}
                    iconId="ri-save-line"
                    iconPosition="right"
                    disabled={disableSave}
                >
                    {t("save")} {selectedObjectsText}
                </Button>
            </div>
        </div>
    );
};
