import { FeatureTypeColumn } from "@/constants/communities/types";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

interface ChoiceTypeProps {
    multipleSelect: string[];
    currentColumn: FeatureTypeColumn;
    handleMultipleSelectChange: (val: string) => void;
}

const ChoiceValueComponent: React.FC<ChoiceTypeProps> = ({ multipleSelect, currentColumn, handleMultipleSelectChange }) => {
    switch (currentColumn.type) {
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

        default:
            break;
    }
    return null;
};

export default ChoiceValueComponent;
