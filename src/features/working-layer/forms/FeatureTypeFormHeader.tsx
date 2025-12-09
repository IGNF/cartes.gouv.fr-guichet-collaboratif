import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";

interface FeatureTypeFormHeaderProps {
    title: string;
    featureId: string | number;
    onBack: () => void;
}

export const FeatureTypeFormHeader: React.FC<FeatureTypeFormHeaderProps> = ({ title, featureId, onBack }) => {
    const { t } = useTranslation({ FeatureTypeFormHeader });
    return (
        <div className="feature-type-form-header">
            <h1 className="feature-type-form-title">
                {title} : {featureId}
            </h1>
            <Button iconId="ri-edit-box-fill" className="feature-type-form-edit-button" priority="tertiary no outline" onClick={onBack}>
                {t("back")}
            </Button>
        </div>
    );
};
