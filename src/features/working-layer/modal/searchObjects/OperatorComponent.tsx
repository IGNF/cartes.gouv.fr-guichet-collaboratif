import { OperatorType } from "@/constants/communities/types";
import Select from "@codegouvfr/react-dsfr/Select";
import React from "react";

interface OperatorProps {
    currentOprators: {
        value: OperatorType;
        title: string;
    }[];
    operator: string;
    onChange: (op: OperatorType) => void;
}

const OperatorComponent: React.FC<OperatorProps> = ({ currentOprators, operator, onChange }) => {
    return (
        <Select label="" nativeSelectProps={{ defaultValue: operator, onChange: (e) => onChange((e.target as HTMLSelectElement).value as OperatorType) }}>
            {currentOprators.map((operator, idx) => (
                <option key={`search_operator_${idx}`} value={operator.value}>
                    {operator.title}
                </option>
            ))}
        </Select>
    );
};

export default OperatorComponent;
