import { REPORTS_API_URL } from "@/constants/urls";
import { useCommunityStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";

interface SelectProps {
    label: string;
    options: string[];
    name: string;
}

const SelectComponent: React.FC<SelectProps> = ({ label, options, name }) => {
    const [selected, setSelected] = useState(-1);

    return (
        <Select
            label={label}
            nativeSelectProps={{
                value: selected,
                name,
                onChange: (e) => {
                    const index = parseInt(e.target.value);
                    setSelected(index);
                },
            }}
            className="filter-report-select"
        >
            <Fragment key=".0">
                <option value={-1}>Selectionnez {label}</option>
                {options.map((option, index) => (
                    <option key={`${label}_${index}`} value={index} selected={selected == index}>
                        {option}
                    </option>
                ))}
            </Fragment>
        </Select>
    );
};

const FilterAndSortReport = () => {
    const { community } = useCommunityStore();

    const statusOptions = useMemo(() => ["submit", "pending0", "pending", "pending1", "pending2", "valid", "valid0", "reject", "reject0", "test", "dump"], []);
    const themeOptions = useMemo(() => ["Thème 1", "Thème 2"], []);
    const sortOptions = useMemo(() => ["opening_date", "updating_date"], []);

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);
        const filterBy = {
            status: statusOptions[parseInt((formData.get("status") as string) || "")],
            theme: themeOptions[parseInt((formData.get("theme") as string) || "")],
            author: formData.get("author"),
            department: formData.get("department"),
        };
        const sortBy = sortOptions[parseInt((formData.get("sort") as string) || "")];

        const url =
            `${REPORTS_API_URL}` +
            `?communities=${community?.id}` +
            (filterBy.department ? `&departements=${filterBy.department}` : "") +
            (filterBy.status ? `&status=${filterBy.status}` : "") +
            (filterBy.author ? `&author=${filterBy.author}` : "") +
            (filterBy.theme ? `&attributes=${filterBy.theme}` : "") +
            (sortBy ? `&sort=${sortBy}:asc` : "");

        console.log(filterBy, sortBy, url);
    };

    return (
        <form className="filter-report">
            <div>
                <h3>Filtrage par :</h3>
                <div className="filter">
                    <SelectComponent name="status" label="Status" options={statusOptions} />
                    <SelectComponent name="theme" label="Thème" options={themeOptions} />
                    <Input
                        className="filter-report-select"
                        label="Auteur"
                        nativeInputProps={{ name: "author", type: "number", inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                    <Input
                        className="filter-report-select"
                        label="Département"
                        nativeInputProps={{ name: "department", type: "number", max: 2, multiple: true }}
                    />
                </div>
            </div>

            <div>
                <h3>Triage : </h3>
                <div className="filter">
                    <SelectComponent name="sort" label="Date" options={sortOptions} />
                </div>
            </div>

            <div className="sumbit">
                <Button iconId="ri-filter-fill" size="large" type="submit" onClick={handleSubmit}>
                    Valider
                </Button>
            </div>
        </form>
    );
};

export default FilterAndSortReport;
