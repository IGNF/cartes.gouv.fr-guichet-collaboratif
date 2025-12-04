import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";

interface FeatureTypeFormActionsProps {
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export const FeatureTypeFormActions: React.FC<FeatureTypeFormActionsProps> = ({ onSave, onDelete, onCancel }) => {
    const { t } = useTranslation({ FeatureTypeFormActions });
    return (
        <div className="feature-type-form-buttons">
            <div className="feature-type-form-actions-left">
                <Button onClick={onDelete} priority="primary" iconId="ri-delete-bin-line" iconPosition="right">
                    {t("delete")}
                </Button>
            </div>

            <div className="feature-type-form-actions-right">
                <Button priority="secondary" onClick={onCancel}>
                    {t("cancel")}
                </Button>

                <Button priority="primary" onClick={onSave} iconId="ri-save-line" iconPosition="right">
                    {t("save")}
                </Button>
            </div>
        </div>
    );
};
