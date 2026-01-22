import { ComponentKey } from "@/i18n/types";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

interface Props {
    t: TranslationFunction<"SearchObjectsModal", ComponentKey>;
    extentList: {
        value: string;
        title: string;
    }[];
    maxNumber: number;
    selectedExtent: string;
    setMaxNumber: (max: number) => void;
    setSelectedExtent: (extent: string) => void;
}

const ConstraintsComponent: React.FC<Props> = ({ t, extentList, maxNumber, selectedExtent, setMaxNumber, setSelectedExtent }) => {
    return (
        <div className="search-property-options">
            <Input
                label={t("max_number_title")}
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
