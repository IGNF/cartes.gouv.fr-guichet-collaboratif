import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusMessage } from "@/constants/communities/types";
import { REPORT_STATUS_LIST } from "@/constants/utils";
import { getCommunityThemes, getTableReports } from "@/api/reportsData";
import { useCommunityStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

interface SelectProps {
    label?: string;
    value?: number;
    defaultOption?: string;
    options: string[] | number[];
    name: string;
    onChange: (selectedIndex: number) => void;
}

export const SelectComponent: React.FC<SelectProps> = ({ label, value = -1, defaultOption, options, name, onChange }) => {
    return (
        <Select
            label={label}
            nativeSelectProps={{
                value,
                name,
                onChange: (e) => {
                    const index = parseInt(e.target.value, 10);
                    if (onChange) onChange(index);
                },
            }}
            className="filter-report__select"
        >
            {defaultOption && <option value={-1}>{defaultOption}</option>}
            {options.map((option, index) => (
                <option key={`${label}_${index}`} value={index}>
                    {option}
                </option>
            ))}
        </Select>
    );
};

const FilterAndSortReport = () => {
    const formRef = useRef<HTMLFormElement>(null);

    const [statusIndex, setStatusIndex] = useState(-1);
    const [themeIndex, setThemeIndex] = useState(-1);

    const [sortOpeningDateIndex, setSortOpeningDateIndex] = useState(0);
    const [sortUpdatingDateIndex, setSortUpdatingDateIndex] = useState(0);

    const { community, addAlertMessage } = useCommunityStore();
    const { limitPerPage, currentPage, setCurrentPage, setFilteredReports, setIsChecked, currentFilters, setCurrentFilters, searchReport, sortBy, setSortBy } =
        useReportStore();
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
        queryKey: ["reports", community?.id, limitPerPage, currentPage, filters, searchReport, sortBy],
        queryFn: () => community && getTableReports(community.id, limitPerPage, currentPage, filters, searchReport, sortBy),
        enabled: !!community,
    });

    const reports = useMemo(() => data?.data ?? [], [data]);
    const statusOptions = useMemo(() => [...new Set(REPORT_STATUS_LIST)], []);
    const themeOptions = useMemo(() => [...new Set(themes)], [themes]);
    const sortOptions = ["Du plus récent au plus ancien", "Du plus ancien au plus récent"];

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        let sortParams = "";

        if (sortOpeningDateIndex >= 0) {
            sortParams = `opening_date:${sortOpeningDateIndex === 0 ? "DESC" : "ASC"}`;
        }
        if (sortUpdatingDateIndex >= 0) {
            sortParams = `updating_date:${sortUpdatingDateIndex === 0 ? "DESC" : "ASC"}`;
        }

        setSortBy(sortParams);

        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);

        const newFilters = {
            status: statusOptions[statusIndex] || "",
            theme: themeOptions[themeIndex] || "",
            author: Number(formData.get("author")) || null,
            department: (formData.get("department") as string) || "",
        };
        setCurrentFilters({ ...newFilters });

        setFilteredReports(reports, true);
        setIsChecked({});
    };

    const resetFiltersAndSort = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        formRef.current?.reset();

        setSortOpeningDateIndex(0);
        setSortUpdatingDateIndex(0);
        setStatusIndex(-1);
        setThemeIndex(-1);
        setCurrentFilters({
            status: "",
            theme: "",
            author: null,
            department: "",
        });
        setCurrentPage(1);
        setFilteredReports([], false);
    };

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, "Erreur lors du chargement des signalements.");
        }
    }, [isErrorReport, addAlertMessage]);

    return (
        <>
            <h1 className="visuallyhidden">Tous les signalements</h1>

            <form ref={formRef} className="filter-report">
                <div>
                    <p className="report-subTitle">Trier par : </p>
                    <div className="sort-report__wrapper">
                        <SelectComponent
                            name="sortByDateCreation"
                            label="Date de création"
                            value={sortOpeningDateIndex}
                            options={sortOptions}
                            onChange={setSortOpeningDateIndex}
                        />
                        <SelectComponent
                            name="sortByDateMAJ"
                            label="Date de mise à jour"
                            value={sortUpdatingDateIndex}
                            options={sortOptions}
                            onChange={setSortUpdatingDateIndex}
                        />
                    </div>
                </div>

                <div>
                    <p className="report-subTitle">Filtrer par :</p>
                    <div className="filter-report__wrapper">
                        <SelectComponent
                            name="status"
                            label="Statut"
                            value={statusIndex}
                            defaultOption="Sélectionner une option"
                            options={statusOptions}
                            onChange={setStatusIndex}
                        />
                        <SelectComponent
                            name="theme"
                            label="Thème"
                            value={themeIndex}
                            defaultOption="Sélectionner une option"
                            options={themeOptions}
                            onChange={setThemeIndex}
                        />

                        <Input
                            className="filter-report__select"
                            label="Auteur"
                            nativeInputProps={{ name: "author", type: "number", inputMode: "numeric", pattern: "[0-9]*" }}
                        />
                        <Input
                            className="filter-report__select"
                            label="Département"
                            nativeInputProps={{
                                placeholder: "Sélectionner une option",
                                name: "department",
                                type: "number",
                                max: 2,
                                multiple: true,
                            }}
                        />
                    </div>
                </div>

                <div className="sumbit">
                    <Button type="submit" onClick={resetFiltersAndSort} priority="secondary">
                        Effacer
                    </Button>
                    <Button type="submit" onClick={handleSubmit}>
                        Appliquer
                    </Button>
                </div>
            </form>
        </>
    );
};

export default FilterAndSortReport;
