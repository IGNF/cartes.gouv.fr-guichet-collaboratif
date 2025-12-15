import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";
import { FeatureTypeMode } from "@/constants/contributions/types";

interface FeatureTypeFormHeaderProps {
    title: string;
    featureId: string | number;
    mode: FeatureTypeMode;
    onModeChange: (mode: FeatureTypeMode) => void;
    onClose: () => void;
}

export const FeatureTypeFormHeader: React.FC<FeatureTypeFormHeaderProps> = ({ title, featureId, mode, onModeChange, onClose }) => {
    const { t } = useTranslation({ FeatureTypeFormHeader });

    const isEditMode = mode === FeatureTypeMode.EDIT;

    return (
        <div className="feature-type-form-header">
            <h1 className="feature-type-form-title">
                {title} : {featureId}
            </h1>
            <Button
                iconId={isEditMode ? "ri-eye-fill" : "ri-edit-box-fill"}
                className="feature-type-form-edit-button"
                priority="tertiary no outline"
                onClick={() => onModeChange(isEditMode ? FeatureTypeMode.VIEW : FeatureTypeMode.EDIT)}
            >
                {isEditMode ? t("back") : t("edit")}
            </Button>
            <Button iconId="ri-close-line" className="drawer-close-button" priority="tertiary no outline" onClick={onClose} title={t("close")} />
        </div>
    );
};
