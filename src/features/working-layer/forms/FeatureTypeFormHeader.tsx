import Button from "@codegouvfr/react-dsfr/Button";

interface FeatureTypeFormHeaderProps {
    title: string;
    featureId: string | number;
    onBack: () => void;
}

export const FeatureTypeFormHeader: React.FC<FeatureTypeFormHeaderProps> = ({ title, featureId, onBack }) => {
    return (
        <div className="feature-type-form-header fr-flex fr-align-items--center">
            <h1 className="feature-type-form-title fr-text--lg">
                {title} : {featureId}
            </h1>

            <Button iconId="ri-eye-fill" className="feature-type-form-edit-button fr-icon--xl" priority="tertiary no outline" onClick={onBack}>
                Retour
            </Button>
        </div>
    );
};
