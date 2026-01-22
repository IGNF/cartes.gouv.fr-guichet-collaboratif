import RuleComponent from "./RuleComponent";
import { Group, GroupOperator, Rule } from "@/constants/contributions/types";
import { createGroup, createRule } from "@/constants/contributions/utils";
import { useTranslation } from "@/i18n";
import Button from "@codegouvfr/react-dsfr/Button";

type GroupProps = {
    className: string;
    group: Group;
    onChange: (group: Group) => void;
    onDelete?: () => void;
};

const GroupComponent: React.FC<GroupProps> = ({ className, group, onChange, onDelete }) => {
    const { t } = useTranslation({ GroupComponent });

    const updateChild = (index: number, updated: Rule | Group) => {
        const newRules = [...group.rules];
        newRules[index] = updated;
        onChange({ ...group, rules: newRules });
    };

    const removeChild = (index: number) => {
        const newRules = group.rules.filter((_, i) => i !== index);
        onChange({ ...group, rules: newRules, operator: newRules.length <= 1 ? GroupOperator.ET : GroupOperator.OU });
    };

    const handleChange = (group: Group, rule: Rule) => {
        const newRoot = {
            ...group,
            rules: group.rules.map((r) => {
                if (r.id === rule.id) return rule;
                return r;
            }),
        };
        onChange(newRoot);
    };

    return (
        <div className={`search-property-group ${className}`}>
            <div className="search-property-header">
                <div className="group-header">
                    <Button
                        size="small"
                        onClick={() =>
                            onChange({
                                ...group,
                                operator: GroupOperator.ET,
                            })
                        }
                        priority={group.operator === GroupOperator.ET ? "secondary" : "tertiary"}
                    >
                        {t("and_operator")}
                    </Button>
                    <Button
                        size="small"
                        onClick={() =>
                            onChange({
                                ...group,
                                operator: GroupOperator.OU,
                            })
                        }
                        priority={group.operator === GroupOperator.OU ? "secondary" : "tertiary"}
                        disabled={group.rules.length <= 1}
                    >
                        {t("or_operator")}
                    </Button>
                </div>
                <div>
                    <Button
                        size="small"
                        iconId="ri-add-box-line"
                        priority="secondary"
                        onClick={() =>
                            onChange({
                                ...group,
                                rules: [...group.rules, createRule()],
                            })
                        }
                    >
                        {t("add_rule")}
                    </Button>

                    <Button
                        size="small"
                        iconId="ri-add-box-fill"
                        priority="secondary"
                        onClick={() =>
                            onChange({
                                ...group,
                                rules: [...group.rules, createGroup()],
                            })
                        }
                    >
                        {t("add_group")}
                    </Button>

                    {onDelete && (
                        <Button size="small" iconId="ri-delete-bin-2-fill" priority="tertiary" onClick={onDelete} style={{ color: "red", borderColor: "red" }}>
                            {t("delete")}
                        </Button>
                    )}
                </div>
            </div>

            <div className="group-children">
                {group.rules.map((item, index) =>
                    "operator" in item ? (
                        <GroupComponent
                            key={item.id}
                            className="group-item group"
                            group={item}
                            onChange={(updated) => updateChild(index, updated)}
                            onDelete={() => removeChild(index)}
                        />
                    ) : (
                        <RuleComponent
                            t={t}
                            rule={item}
                            className="group-item"
                            key={item.id}
                            onDelete={() => removeChild(index)}
                            onChange={(rule: Rule) => handleChange(group, rule)}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default GroupComponent;
