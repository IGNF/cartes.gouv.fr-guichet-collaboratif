import { getReports } from "@/api/reportsData";
import { GetReportData } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";
import { useCommunityStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";

interface SelectProps {
    label: string;
    options: string[];
    name: string;
}
type SortableKeys = "opening_date" | "updating_date";

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

// Convert reports obj into arrays of displayable strings for each table row..
const transformReportsToTableData = (reports: GetReportData[]) => {
    return reports.map((report) => [
        report.status || "-",
        report.author?.username || "-",
        report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
        report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
        report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
    ]);
};

const FilterAndSortReport = () => {
    const { community } = useCommunityStore();
    const { setFilteredReports } = useReportStore();
    const queryKey = `${REPORTS_API_URL}?communities=${community?.id}`;
    const {
        data: reports = [],
        isLoading,
        error,
    } = useQuery<GetReportData[]>({
        queryKey: [queryKey],
        queryFn: () => (community ? getReports(community.id) : Promise.resolve([])),
        enabled: !!community,
    });
    const tableData = reports ? transformReportsToTableData(reports) : [];

    const statusList = tableData.map((list) => list[0]);
    const themeList = tableData.map((list) => list[4]);
    const statusOptions = useMemo(() => [...new Set(statusList)], [statusList]);
    const themeOptions = useMemo(() => [...new Set(themeList)], [themeList]);
    const sortOptions: SortableKeys[] = useMemo(() => {
        if (reports.length > 0) {
            const keys = Object.keys(reports[0]);
            const filteredKeys = keys.filter((key) => key === "opening_date" || key === "updating_date");
            return filteredKeys;
        }
        return [];
    }, [reports]);

    const [, setSearchParams] = useSearchParams();
    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);
        const filterBy = {
            status: statusOptions[parseInt((formData.get("status") as string) || "")],
            theme: themeOptions[parseInt((formData.get("theme") as string) || "")],
            author: Number(formData.get("author")),
            department: formData.get("department"),
        };
        const sortBy = sortOptions[parseInt((formData.get("sort") as SortableKeys) || "")];

        const params = new URLSearchParams();
        const url =
            `${REPORTS_API_URL}` +
            params.set("communities", community?.id.toString() || "") +
            params.set("fields", "id,status,author,commune,departement,opening_date,updating_date,attributes") +
            (filterBy.department ? params.set("departements", filterBy.department.toString()) : "") +
            (filterBy.status ? params.set("status", filterBy.status) : "") +
            (filterBy.author ? params.set("author", filterBy.author.toString()) : "") +
            (filterBy.theme ? params.set("attributes", filterBy.theme) : "") +
            (sortBy ? params.set("sort", sortBy + "asc") : "");

        params.set("page", "1"); // go to initial page (page 1) when totalPage changes
        setSearchParams(params);
        console.log(filterBy, sortBy, url);

        const filtered = reports.filter(
            (report) =>
                (!filterBy.status || report.status === filterBy.status) &&
                (!filterBy.theme || report.attributes.some((attr) => attr.theme === filterBy.theme)) &&
                (!filterBy.author || report.author?.id === filterBy.author) &&
                (!filterBy.department || report.departement?.name === filterBy.department)
        );

        if (sortBy) {
            //DESC
            filtered.sort((a, b) => {
                const aValue = a[sortBy] ?? "";
                const bValue = b[sortBy] ?? "";
                return new Date(bValue).getTime() - new Date(aValue).getTime();
            });
        }
        setFilteredReports(filtered, true);

        if (isLoading) return <div>Chargement des signalements...</div>;
        if (error) return <div>Erreur lors du chargement des signalements.</div>;
        if (filtered.length === 0) return <div>Aucun signalement trouvé.</div>;
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
