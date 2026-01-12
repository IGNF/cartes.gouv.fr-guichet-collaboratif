import { FeatureTypeColumn } from "@/constants/communities/types";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";

interface ChoiceTypeProps {
    multipleSelect: string[];
    currentColumn: FeatureTypeColumn | undefined;
    handleMultipleSelectChange: (val: string) => void;
}

const ChoiceValueComponent: React.FC<ChoiceTypeProps> = ({ multipleSelect, currentColumn, handleMultipleSelectChange }) => {
    switch (currentColumn?.type) {
        case "String":
            if (currentColumn.enum) {
                return (
                    <Select
                        label=""
                        nativeSelectProps={{
                            defaultValue: multipleSelect,
                            multiple: true,
                            size: 3,
                            onClick: (e) => handleMultipleSelectChange((e.target as HTMLSelectElement).value),
                        }}
                    >
                        {currentColumn?.enum?.map((val, idx) => (
                            <option key={`multiple_${val}_${idx}`} value={val}>
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
                        defaultValue: multipleSelect.join(""),
                        onChange: (e) => handleMultipleSelectChange(e.target.value),
                    }}
                />
            );

        case "Integer":
            return (
                <Input
                    label=""
                    nativeInputProps={{
                        defaultValue: multipleSelect.join(""),
                        type: "number",
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        onChange: (e) => handleMultipleSelectChange(e.target.value),
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
                            },
                        },
                        {
                            label: "False",
                            nativeInputProps: {
                                value: "false",
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
