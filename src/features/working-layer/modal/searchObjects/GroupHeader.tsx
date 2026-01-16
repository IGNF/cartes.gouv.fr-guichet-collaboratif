import { ConditionGroup } from "@/constants/contributions/types";
import Button from "@codegouvfr/react-dsfr/Button";

interface GroupHeaderProps {
    group?: ConditionGroup;
    andOr: boolean;
    setAndOr: (andOr: boolean) => void;
    addRule: (group: ConditionGroup | undefined) => void;
    addGroup: (group: ConditionGroup | undefined) => void;
    removeGroup?: (group: ConditionGroup) => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group, andOr, setAndOr, addRule, addGroup, removeGroup }) => {
    return (
        <div className="search-property-header">
            <div>
                <Button priority={andOr ? "secondary" : "tertiary"} size="small" onClick={() => setAndOr(true)}>
                    And
                </Button>
                <Button priority={!andOr ? "secondary" : "tertiary"} size="small" onClick={() => setAndOr(false)}>
                    Or
                </Button>
            </div>
            <div className="search-property-rule-group-actions">
                <Button iconId="ri-add-box-line" priority="secondary" size="small" onClick={() => addRule(group)}>
                    Ajouter une règle
                </Button>
                <Button iconId="ri-add-box-fill" priority="secondary" size="small" onClick={() => addGroup(group)}>
                    Ajouter un groupe
                </Button>
                {removeGroup && group && (
                    <Button iconId="ri-delete-bin-line" priority="secondary" size="small" onClick={() => removeGroup(group)}>
                        Supprimer
                    </Button>
                )}
            </div>
        </div>
    );
};

export default GroupHeader;
