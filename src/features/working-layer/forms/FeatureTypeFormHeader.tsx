import Button from "@codegouvfr/react-dsfr/Button";

interface FeatureTypeFormHeaderProps {
    title: string;
    featureId: string | number;
    onBack: () => void;
}

export const FeatureTypeFormHeader: React.FC<FeatureTypeFormHeaderProps> = ({ title, featureId, onBack }) => {
    return (
        <div className="feature-type-form-header">
            <h1 className="feature-type-form-title">
                {title} : {featureId}
            </h1>
            <Button iconId="ri-eye-fill" className="feature-type-form-back-button" priority="tertiary no outline" onClick={onBack}>
                Retour
            </Button>
        </div>
    );
};
