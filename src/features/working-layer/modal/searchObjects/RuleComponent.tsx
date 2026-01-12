import { CommunityGeoservice } from "@/constants/communities/types";
import { useCommunityStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useCallback, useMemo, useState } from "react";
import ChoiceValueComponent from "./ChoiceValueComponent";
import useOperatorList from "@/hooks/working-layer/searchObjects/useOperatorList";

type RuleProps = {
    className: string;
    onDelete: () => void;
};

const RuleComponent: React.FC<RuleProps> = ({ className, onDelete }) => {
    const { mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();
    const operatorList = useOperatorList();

    const [multipleSelect, setMultipleSelect] = useState<string[]>([]);
    const [condition, setCondition] = useState<string>("");
    const [type, setType] = useState<string>("-1");

    const geoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer.geoservice.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const queryableColumns = useMemo(() => geoservice?.columns.filter((col) => col.queryable), [geoservice]);

    const currentColumn = useMemo(() => queryableColumns?.find((col) => col.name === type), [queryableColumns, type]);

    const handleTypeChange = useCallback(
        (type: string) => {
            const col = queryableColumns?.find((col) => col.name === type);
            setType(() => type);
            setMultipleSelect(() => col?.enum ?? []);
        },
        [queryableColumns]
    );

    const handleMultipleSelectChange = useCallback(
        (val: string) => {
            if (currentColumn?.enum) {
                if (multipleSelect.includes(val)) {
                    setMultipleSelect((prev) => prev.filter((val) => val !== val));
                    return;
                }
                setMultipleSelect((prev) => [...prev, val]);
            }
            setMultipleSelect(() => [val]);
        },
        [multipleSelect, currentColumn]
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
                    <Select label="" nativeSelectProps={{ defaultValue: condition, onClick: (e) => setCondition((e.target as HTMLSelectElement).value) }}>
                        {operatorList.map((operator, idx) => (
                            <option key={`search_operator_${idx}`} value={operator.value}>
                                {operator.title}
                            </option>
                        ))}
                    </Select>
                    <ChoiceValueComponent
                        multipleSelect={multipleSelect}
                        currentColumn={currentColumn}
                        handleMultipleSelectChange={handleMultipleSelectChange}
                    />
                </>
            )}

            <Button size="small" iconId="ri-delete-bin-2-fill" title="" priority="tertiary" onClick={onDelete} style={{ color: "red" }}>
                Supprimer
            </Button>
        </div>
    );
};

export default RuleComponent;
