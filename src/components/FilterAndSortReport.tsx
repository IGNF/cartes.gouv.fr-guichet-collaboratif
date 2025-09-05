import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react/jsx-runtime";
import { useCommunityStore, useReportStore } from "@/store";
import { getCommunityThemes, getTableReports } from "@/api/reportsData";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { REPORT_TABLE_LIMIT_OPTIONS } from "@/constants/reports/utils";
import { StatusMessage } from "@/constants/communities/types";
import { REPORT_STATUS_LIST } from "@/constants/utils";

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

const FilterAndSortReport = () => {
    const { community, addAlertMessage } = useCommunityStore();
    const { limitPerPage, setLimitPerPage, currentPage, setFilteredReports, setIsChecked, currentFilters, setCurrentFilters, searchReport } = useReportStore();
    const filters = useMemo(
        () => ({
            status: currentFilters.status,
            theme: currentFilters.theme,
            author: currentFilters.author,
            department: currentFilters.department,
        }),
        [currentFilters]
    );

    const { data: themes } = useQuery<string[]>({
        queryKey: ["communityThemes", community?.id],
        queryFn: () => {
            if (!community?.id) {
                return Promise.resolve([]);
            }
            return getCommunityThemes(community.id);
        },
        enabled: !!community?.id,
    });

    const { data, error: isErrorReport } = useQuery({
        queryKey: ["reports", community?.id, limitPerPage, currentPage, searchReport, filters],
        queryFn: () => community && getTableReports(community.id, limitPerPage, currentPage, filters, searchReport),
        enabled: !!community,
    });

    const reports = useMemo(() => data?.data ?? [], [data]);
    const statusList = useMemo(() => REPORT_STATUS_LIST, []);
    const themeList = themes?.map((list) => list);
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

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);
        const limitIndex = parseInt((formData.get("limit") as string) || "-1");
        if (limitIndex >= 0) {
            setLimitPerPage(REPORT_TABLE_LIMIT_OPTIONS[limitIndex]);
        }
        const newFilters = {
            status: statusOptions[parseInt((formData.get("status") as string) || "")] || "",
            theme: themeOptions[parseInt((formData.get("theme") as string) || "")] || "",
            author: Number(formData.get("author")) || null,
            department: (formData.get("department") as string) || "",
        };
        setCurrentFilters({ ...newFilters });
        const sortBy = sortOptions[parseInt((formData.get("sort") as SortableKeys) || "")];

        if (sortBy) {
            reports.sort((a, b) => {
                const aValue = a[sortBy] ?? "";
                const bValue = b[sortBy] ?? "";
                return new Date(aValue).getTime() - new Date(bValue).getTime();
            });
        }

        setFilteredReports(reports, true);
        setIsChecked({});
    };

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, "Erreur lors du chargement des signalements.");
        }
    }, [isErrorReport, addAlertMessage]);

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

                        <SelectComponent name="limit" label="Nombre d’éléments par page" defaultOption="une valeur" options={REPORT_TABLE_LIMIT_OPTIONS} />
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
