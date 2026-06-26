import {
    BETWEEN_OPERATORS,
    CommunityGeoservice,
    FeatureTypeColumn,
    MULTI_VALUE_OPERATORS,
    NO_VALUE_OPERATORS,
    OperatorType,
} from "@/constants/communities/types";
import { useCommunityStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useCallback, useMemo, useState } from "react";
import ChoiceValueComponent from "./ChoiceValueComponent";
import OperatorComponent from "./OperatorComponent";
import { Rule } from "@/constants/savedSearches/types";
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

function getDefaultForColumn(col: FeatureTypeColumn | undefined): string {
    if (!col) return "";
    switch (col.type) {
        case "Integer":
            return "0";
        case "Double":
            return "0";
        case "Boolean":
            return "true";
        case "String":
            return col.enum?.[0] ?? "";
        default:
            return "";
    }
}

function getInitialValues(op: OperatorType, col: FeatureTypeColumn | undefined, current: string[]): string[] {
    if (NO_VALUE_OPERATORS.has(op)) return [];
    const defaultVal = getDefaultForColumn(col);
    if (BETWEEN_OPERATORS.has(op)) {
        return [current[0] ?? defaultVal, current[1] ?? defaultVal];
    }
    return current.length > 0 ? [current[0]] : [defaultVal];
}

const RuleComponent: React.FC<RuleProps> = ({ t, rule, className, onDelete, onChange }) => {
    const { mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const [type, setType] = useState<string>(rule.field ?? "-1");
    const [operator, setOperator] = useState<OperatorType>(rule.ruleOperator ?? OperatorType.in);
    const [choiceValue, setChoiceValue] = useState<string[]>(rule.values ?? []);

    const geoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const queryableColumns = useMemo(() => geoservice?.columns.filter((col) => col.queryable), [geoservice]);
    const currentColumn = useMemo(() => queryableColumns?.find((col) => col.name === type), [queryableColumns, type]);
    const operatorList = useOperatorList();
    const currentOprators = useMemo(() => getOperators(currentColumn, operatorList), [currentColumn, operatorList]);

    const handleTypeChange = useCallback(
        (newType: string) => {
            const newCurrentColumn = queryableColumns?.find((col) => col.name === newType);
            const newCurrentOperators = getOperators(newCurrentColumn, operatorList);
            const newOperator = type !== newType ? newCurrentOperators[0]?.value : operator;
            const newValues = getInitialValues(newOperator, newCurrentColumn, []);

            setType(newType);
            setOperator(newOperator);
            setChoiceValue(newValues);
            onChange({ ...rule, field: newType, ruleOperator: newOperator, values: newValues });
        },
        [rule, type, operator, operatorList, queryableColumns, onChange]
    );

    const handleChoiceValueChange = useCallback(
        (val: string, index = 0) => {
            let newValue: string[];
            if (MULTI_VALUE_OPERATORS.has(operator)) {
                newValue = choiceValue.includes(val) ? choiceValue.filter((cv) => cv !== val) : [...choiceValue, val];
            } else {
                newValue = [...choiceValue];
                newValue[index] = val;
            }
            setChoiceValue(newValue);
            onChange({ ...rule, values: newValue, ruleOperator: operator });
        },
        [choiceValue, operator, rule, onChange]
    );

    const handleOperatorChange = useCallback(
        (op: OperatorType) => {
            const newValues = getInitialValues(op, currentColumn, choiceValue);
            setOperator(op);
            setChoiceValue(newValues);
            onChange({ ...rule, ruleOperator: op, values: newValues });
        },
        [currentColumn, choiceValue, rule, onChange]
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
                    <ChoiceValueComponent
                        choiceValue={choiceValue}
                        currentColumn={currentColumn}
                        operator={operator}
                        handleChoiceValueChange={handleChoiceValueChange}
                        disabled={NO_VALUE_OPERATORS.has(operator)}
                    />
                </>
            )}

            <Button size="small" iconId="fr-icon-delete-line" title="" priority="tertiary" onClick={onDelete}>
                {t("delete")}
            </Button>
        </div>
    );
};

export default RuleComponent;
