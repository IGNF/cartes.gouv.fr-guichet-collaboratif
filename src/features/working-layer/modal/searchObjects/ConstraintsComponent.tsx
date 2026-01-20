import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

interface Props {
    extentList: {
        value: string;
        title: string;
    }[];
    maxNumber: number;
    selectedExtent: string;
    setMaxNumber: (max: number) => void;
    setSelectedExtent: (extent: string) => void;
}

const ConstraintsComponent: React.FC<Props> = ({ extentList, maxNumber, selectedExtent, setMaxNumber, setSelectedExtent }) => {
    return (
        <div className="search-property-options">
            <Input
                label="Nombre max. de résultats"
                nativeInputProps={{
                    type: "number",
                    pattern: "[0-9]*",
                    inputMode: "numeric",
                    max: 10000,
                    defaultValue: maxNumber,
                    placeholder: `${maxNumber}`,
                    onChange: (e) => setMaxNumber(parseInt(e.target.value)),
                }}
            />
            <Select
                label=""
                nativeSelectProps={{
                    value: selectedExtent,
                    name: "extent",
                    onChange: (e) => {
                        setSelectedExtent(e.target.value);
                    },
                }}
            >
                {extentList.map((extent, idx) => (
                    <option key={`search_extent_${idx}`} value={extent.value}>
                        {extent.title}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default ConstraintsComponent;
