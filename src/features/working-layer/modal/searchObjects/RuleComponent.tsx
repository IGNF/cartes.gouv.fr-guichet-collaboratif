import { CommunityGeoservice, OperatorType } from "@/constants/communities/types";
import { useCommunityStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useCallback, useMemo, useState } from "react";
import ChoiceValueComponent from "./ChoiceValueComponent";
import OperatorComponent from "./OperatorComponent";
import { Rule } from "@/constants/contributions/types";
import useOperatorList from "@/hooks/working-layer/searchObjects/useOperatorList";
import { getOperators } from "@/constants/working-layer/utils";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey } from "@/i18n/types";

type RuleProps = {
    t: TranslationFunction<"GroupComponent", ComponentKey>;
    rule: Rule;
    className: string;
    onDelete: () => void;
    onChange: (rule: Rule) => void;
};

const RuleComponent: React.FC<RuleProps> = ({ t, rule, className, onDelete, onChange }) => {
    const { mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const [type, setType] = useState<string>(rule.field ?? "-1");
    const [operator, setOperator] = useState<OperatorType>(rule.ruleOperator ?? OperatorType.in);
    const [choiceValue, setChoiceValue] = useState<string[]>(rule.values ?? []);

    const geoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer.geoservice.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const queryableColumns = useMemo(() => geoservice?.columns.filter((col) => col.queryable), [geoservice]);

    const currentColumn = useMemo(() => queryableColumns?.find((col) => col.name === type), [queryableColumns, type]);

    const operatorList = useOperatorList();

    const currentOprators = useMemo(() => getOperators(currentColumn, operatorList), [currentColumn, operatorList]);

    const handleTypeChange = useCallback(
        (newType: string) => {
            let newOperator = operator;
            if (type !== newType) {
                const newCurrentColumn = queryableColumns?.find((col) => col.name === newType);
                const newCurrentOperators = getOperators(newCurrentColumn, operatorList);
                newOperator = newCurrentOperators[0]?.value;
            }

            setType(() => newType);
            setOperator(newOperator);
            setChoiceValue(() => []);
            onChange({ ...rule, field: newType, ruleOperator: newOperator, values: [] });
        },
        [rule, type, operator, operatorList, queryableColumns, onChange]
    );

    const handleChoiceValueChange = useCallback(
        (val: string) => {
            let newValue = [val];
            if (currentColumn?.enum) {
                if (choiceValue.includes(val)) {
                    newValue = choiceValue.filter((cv) => cv !== val);
                } else {
                    newValue = [...choiceValue, val];
                }
            }
            setChoiceValue(() => newValue);
            onChange({ ...rule, values: newValue, ruleOperator: operator });
        },
        [choiceValue, currentColumn, rule, operator, onChange]
    );

    const handleOperatorChange = useCallback(
        (op: OperatorType) => {
            setOperator(op);
            onChange({ ...rule, ruleOperator: op });
        },
        [rule, onChange]
    );

    return (
        <div className={`search-property-rule ${className}`}>
            <Select label="" nativeSelectProps={{ defaultValue: type, onChange: (e) => handleTypeChange((e.target as HTMLSelectElement).value) }}>
                <option value={"-1"}>-----------</option>
                {queryableColumns?.map((col, idx) => (
                    <option key={`rule_quaryable_${idx}`} value={col.name}>
                        {col.title}
                    </option>
                ))}
            </Select>

            {type !== "-1" && (
                <>
                    <OperatorComponent currentOprators={currentOprators} operator={operator} onChange={handleOperatorChange} />
                    <ChoiceValueComponent choiceValue={choiceValue} currentColumn={currentColumn} handleChoiceValueChange={handleChoiceValueChange} />
                </>
            )}

            <Button size="small" iconId="ri-delete-bin-2-fill" title="" priority="tertiary" onClick={onDelete} style={{ color: "red" }}>
                {t("delete")}
            </Button>
        </div>
    );
};

export default RuleComponent;
