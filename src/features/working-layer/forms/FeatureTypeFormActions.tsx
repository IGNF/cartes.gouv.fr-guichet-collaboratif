import Button from "@codegouvfr/react-dsfr/Button";

interface FeatureTypeFormActionsProps {
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export const FeatureTypeFormActions: React.FC<FeatureTypeFormActionsProps> = ({ onSave, onDelete, onCancel }) => {
    return (
        <div className="feature-type-form-buttons">
            <div className="feature-type-form-actions-left">
                <Button onClick={onDelete} priority="primary" iconId="ri-delete-bin-line" iconPosition="right">
                    Supprimer
                </Button>
            </div>

            <div className="feature-type-form-actions-right">
                <Button priority="secondary" onClick={onCancel}>
                    Annuler
                </Button>

                <Button priority="primary" onClick={onSave} iconId="ri-save-line" iconPosition="right">
                    Sauvegarder
                </Button>
            </div>
        </div>
    );
};
