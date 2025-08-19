import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react/jsx-runtime";
import { useCommunityStore, useReportStore } from "@/store";
import { getReports } from "@/api/reportsData";
import { CommunityReport } from "@/constants/reports/types";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import { REPORTS_API_URL } from "@/constants/urls";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

interface SelectProps {
    label: string;
    defaultOption: string;
    options: string[] | number[];
    name: string;
}
type SortableKeys = "opening_date" | "updating_date";

const SelectComponent: React.FC<SelectProps> = ({ label, defaultOption, options, name }) => {
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
                <option value={-1}>Selectionnez {defaultOption}</option>
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
const transformReportsToTableData = (reports: CommunityReport[]) => {
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
    const { setFilteredReports, setIsChecked, setCurrentFilters, searchReport } = useReportStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const queryKey = `${REPORTS_API_URL}?communities=${community?.id}`;
    const {
        data: reports = [],
        isLoading,
        error,
    } = useQuery<CommunityReport[]>({
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

    const limitOptions = [2, 5, 10, 15, 20, 30];

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);
        const newFilters = {
            status: statusOptions[parseInt((formData.get("status") as string) || "")] || "",
            theme: themeOptions[parseInt((formData.get("theme") as string) || "")] || "",
            author: Number(formData.get("author")) || null,
            department: (formData.get("department") as string) || "",
        };
        setCurrentFilters(newFilters);
        const sortBy = sortOptions[parseInt((formData.get("sort") as SortableKeys) || "")];

        const limitBy = limitOptions[parseInt(formData.get("limit") as string)];
        const params = new URLSearchParams();
        const search = searchParams.get("search") || "";
        params.set("communities", community?.id?.toString() || "");
        if (limitBy) params.set("limit", limitBy?.toString() || "");
        if (newFilters.department) params.set("departements", newFilters.department.toString());
        if (newFilters.status) params.set("status", newFilters.status);
        if (newFilters.author) params.set("author", newFilters.author.toString());
        if (newFilters.theme) params.set("attributes", newFilters.theme);
        if (sortBy) params.set("sort", sortBy);

        params.set("search", search); // set search param when click
        params.set("page", "1"); // go to initial page (page 1)
        setSearchParams(params);
        const searchText = searchReport || "";

        const filtered = applyFiltersToReports(reports, newFilters, searchText);
        if (sortBy) {
            //ASC
            filtered.sort((a, b) => {
                const aValue = a[sortBy] ?? "";
                const bValue = b[sortBy] ?? "";
                return new Date(aValue).getTime() - new Date(bValue).getTime();
            });
        }
        setFilteredReports(filtered, true);
        setIsChecked({}); // uncheck all rows
    };
    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;

    return (
        <>
            <h1 className="visuallyhidden">Tous les signalements</h1>

            <form className="filter-report">
                <div>
                    <h2 className="t-h3">Filtrer par :</h2>
                    <div className="filter-report__wrapper">
                        <SelectComponent name="status" label="Status" defaultOption="un status" options={statusOptions} />
                        <SelectComponent name="theme" label="Thème" defaultOption="un thème" options={themeOptions} />
                        <Input
                            className="filter-report__select"
                            label="Auteur"
                            nativeInputProps={{ name: "author", type: "number", inputMode: "numeric", pattern: "[0-9]*" }}
                        />
                        <Input
                            className="filter-report__select"
                            label="Département"
                            nativeInputProps={{ name: "department", type: "number", max: 2, multiple: true }}
                        />
                    </div>
                </div>

                <div>
                    <h2 className="t-h3">Trier par : </h2>
                    <div className="sort-report__wrapper">
                        <SelectComponent name="sort" label="Date" defaultOption="une date" options={sortOptions} />

                        <SelectComponent name="limit" label="Nombre d’éléments par page" defaultOption="une valeur" options={limitOptions} />
                    </div>
                </div>

                <div className="sumbit">
                    <Button iconId="ri-filter-fill" size="large" type="submit" onClick={handleSubmit}>
                        Valider
                    </Button>
                </div>
            </form>
        </>
    );
};

export default FilterAndSortReport;
