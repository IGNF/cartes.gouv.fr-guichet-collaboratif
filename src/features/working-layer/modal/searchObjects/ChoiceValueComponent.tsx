import { FeatureTypeColumn } from "@/constants/communities/types";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { normalizeColumnEnum } from "@/constants/communities/utils";

interface ChoiceTypeProps {
    choiceValue: string[];
    currentColumn: FeatureTypeColumn | undefined;
    handleChoiceValueChange: (val: string) => void;
}

const ChoiceValueComponent: React.FC<ChoiceTypeProps> = ({ choiceValue, currentColumn, handleChoiceValueChange }) => {
    const enumValues = normalizeColumnEnum(currentColumn?.enum);

    switch (currentColumn?.type) {
        case "String":
            if (enumValues.length > 0) {
                return (
                    <Select
                        label=""
                        nativeSelectProps={{
                            value: choiceValue[0] ?? "",
                            onChange: (e) => handleChoiceValueChange((e.target as HTMLSelectElement).value),
                        }}
                    >
                        <option value="">Sélectionner une option</option>
                        {enumValues.map((val, idx) => (
                            <option key={`option_${val}_${idx}`} value={val ?? ""}>
                                {val ?? "null"}
                            </option>
                        ))}
                    </Select>
                );
            }
            return (
                <Input
                    label=""
                    nativeInputProps={{
                        defaultValue: choiceValue.join(""),
                        onChange: (e) => handleChoiceValueChange(e.target.value),
                    }}
                />
            );

        case "Integer":
            return (
                <Input
                    label=""
                    nativeInputProps={{
                        defaultValue: choiceValue.join(""),
                        type: "number",
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        onChange: (e) => handleChoiceValueChange(e.target.value),
                    }}
                />
            );
        case "Double":
            return (
                <Input
                    label=""
                    nativeInputProps={{
                        defaultValue: choiceValue.join(""),
                        type: "double",
                        inputMode: "numeric",
                        step: "0,001",
                        onChange: (e) => handleChoiceValueChange(e.target.value),
                    }}
                />
            );
        case "Boolean":
            return (
                <RadioButtons
                    legend=""
                    orientation="horizontal"
                    options={[
                        {
                            label: "True",
                            nativeInputProps: {
                                value: "true",
                                onChange: (e) => handleChoiceValueChange(e.target.value),
                            },
                        },
                        {
                            label: "False",
                            nativeInputProps: {
                                value: "false",
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
