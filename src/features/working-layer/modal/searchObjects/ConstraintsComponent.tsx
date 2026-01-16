import useExtentList from "@/hooks/working-layer/searchObjects/useExtentList";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

const ConstraintsComponent = () => {
    const extentList = useExtentList();
    return (
        <div className="search-property-options">
            <Input
                label="Nombre max. de résultats"
                nativeInputProps={{ type: "number", pattern: "[0-9]*", inputMode: "numeric", defaultValue: 20, placeholder: "20" }}
            />
            <Select
                label=""
                nativeSelectProps={{
                    value: extentList[0].value,
                    name: "extent",
                    onChange: () => {},
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
