import { BETWEEN_OPERATORS, FeatureTypeColumn, OperatorType } from "@/constants/communities/types";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { normalizeColumnEnum } from "@/constants/communities/utils";

interface ChoiceTypeProps {
    choiceValue: string[];
    currentColumn: FeatureTypeColumn | undefined;
    operator: OperatorType;
    handleChoiceValueChange: (val: string, index?: number) => void;
    disabled?: boolean;
}

type FieldIndex = 0 | 1;

const BetweenRow = ({ indicator, children }: { indicator: string; children: React.ReactNode }) => (
    <div className="choice-value-between-row">
        <span className="choice-value-indicator">{indicator}</span>
        {children}
    </div>
);

const BetweenFields = ({ renderField }: { renderField: (index: FieldIndex) => React.ReactNode }) => (
    <div className="choice-value-between">
        <BetweenRow indicator="-">{renderField(0)}</BetweenRow>
        <BetweenRow indicator="+">{renderField(1)}</BetweenRow>
    </div>
);

const ChoiceValueComponent: React.FC<ChoiceTypeProps> = ({ choiceValue, currentColumn, operator, handleChoiceValueChange, disabled = false }) => {
    const isBetween = BETWEEN_OPERATORS.has(operator);
    const enumValues = normalizeColumnEnum(currentColumn?.enum);

    const renderTextInput = (index: FieldIndex) => (
        <Input
            label=""
            disabled={disabled}
            nativeInputProps={{
                value: choiceValue[index] ?? "",
                onChange: (e) => handleChoiceValueChange(e.target.value, index),
            }}
        />
    );

    const renderIntegerInput = (index: FieldIndex) => (
        <Input
            label=""
            disabled={disabled}
            nativeInputProps={{
                value: choiceValue[index] ?? "0",
                type: "number",
                inputMode: "numeric",
                pattern: "[0-9]*",
                onChange: (e) => handleChoiceValueChange(e.target.value, index),
            }}
        />
    );

    const renderDoubleInput = (index: FieldIndex) => (
        <Input
            label=""
            disabled={disabled}
            nativeInputProps={{
                value: choiceValue[index] ?? "0",
                type: "number",
                inputMode: "decimal",
                step: "0.001",
                onChange: (e) => handleChoiceValueChange(e.target.value, index),
            }}
        />
    );

    const renderField = (render: (index: FieldIndex) => React.ReactNode) => (isBetween ? <BetweenFields renderField={render} /> : render(0));

    switch (currentColumn?.type) {
        case "String":
            if (enumValues.length > 0) {
                return (
                    <Checkbox
                        className="choice-value-enum"
                        legend=""
                        small
                        disabled={disabled}
                        options={enumValues.map((val) => ({
                            label: String(val ?? "null"),
                            nativeInputProps: {
                                value: val ?? "",
                                checked: choiceValue.includes(String(val ?? "")),
                                onChange: (e) => handleChoiceValueChange(e.target.value),
                            },
                        }))}
                    />
                );
            }
            return renderField(renderTextInput);

        case "Integer":
            return renderField(renderIntegerInput);

        case "Double":
            return renderField(renderDoubleInput);

        case "Boolean":
            return (
                <RadioButtons
                    legend=""
                    orientation="horizontal"
                    disabled={disabled}
                    options={[
                        {
                            label: "True",
                            nativeInputProps: {
                                value: "true",
                                checked: choiceValue[0] === "true",
                                onChange: (e) => handleChoiceValueChange(e.target.value),
                            },
                        },
                        {
                            label: "False",
                            nativeInputProps: {
                                value: "false",
                                checked: choiceValue[0] === "false",
                                onChange: (e) => handleChoiceValueChange(e.target.value),
                            },
                        },
                    ]}
                />
            );
        default:
            break;
    }
    return null;
};

export default ChoiceValueComponent;
