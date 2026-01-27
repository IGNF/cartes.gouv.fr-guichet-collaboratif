import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusMessage } from "@/constants/communities/types";
import { REPORT_STATUS_LIST } from "@/constants/utils";
import { getCommunityThemes, getTableReports } from "@/api/reportsData";
import { useCommunityStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useTranslation } from "@/i18n";

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

enum SortField {
    OpeningDate = "opening_date",
    UpdatingDate = "updating_date",
}

const FilterAndSortReport = () => {
    const { t } = useTranslation({ FilterAndSortReport });
    const formRef = useRef<HTMLFormElement>(null);

    const [statusIndex, setStatusIndex] = useState(-1);
    const [themeIndex, setThemeIndex] = useState(-1);
    const [sortOpeningDateIndex, setSortOpeningDateIndex] = useState(0);
    const [sortUpdatingDateIndex, setSortUpdatingDateIndex] = useState(0);

    const { community, addAlertMessage } = useCommunityStore();
    const {
        limitPerPage,
        currentPage,
        setCurrentPage,
        setFilteredReports,
        setIsChecked,
        currentFilters,
        setCurrentFilters,
        searchReport,
        sortBy,
        setSortBy,
        syncUrlFromState,
    } = useReportStore();
    const filters = useMemo(
        () => ({
            status: currentFilters.status,
            theme: currentFilters.theme,
            author: currentFilters.author,
            departement: currentFilters.departement,
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
    const sortOptions = [t("newToOld"), t("oldToNew")];

    useEffect(() => {
        if (!sortBy) {
            setSortOpeningDateIndex(0);
            setSortUpdatingDateIndex(0);
            return;
        }

        const [field, order] = sortBy.split(":");
        const idx = order === "DESC" ? 0 : 1;

        if (field === SortField.OpeningDate) {
            setSortOpeningDateIndex(idx);
            setSortUpdatingDateIndex(-1);
        } else if (field === SortField.UpdatingDate) {
            setSortUpdatingDateIndex(idx);
            setSortOpeningDateIndex(-1);
        }
    }, [sortBy]);

    useEffect(() => {
        if (currentFilters.status) {
            const idx = statusOptions.indexOf(currentFilters.status);
            setStatusIndex(idx);
        }
        if (currentFilters.theme) {
            const idx = themeOptions.indexOf(currentFilters.theme);
            setThemeIndex(idx);
        }
    }, [currentFilters.status, currentFilters.theme, statusOptions, themeOptions]);

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, t("loading_error"));
        }
    }, [isErrorReport, addAlertMessage]);

    const onChangeOpeningDate = (index: number) => {
        setSortOpeningDateIndex(index);
        setSortUpdatingDateIndex(-1);
    };

    const onChangeUpdatingDate = (index: number) => {
        setSortUpdatingDateIndex(index);
        setSortOpeningDateIndex(-1);
    };

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
            departement: (formData.get("departement") as string) || "",
        };
        setCurrentFilters({ ...newFilters });

        setFilteredReports(reports, true);
        setIsChecked({});
        syncUrlFromState();
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
            departement: "",
        });
        setCurrentPage(1);
        setFilteredReports([], false);
    };
    return (
        <>
            <form ref={formRef} className="filter-report">
                <div>
                    <p className="report-subTitle">{t("sortBy")}: </p>
                    <div className="sort-report__wrapper">
                        <SelectComponent
                            name="sortByDateCreation"
                            label={t("dateCreation")}
                            value={sortOpeningDateIndex}
                            options={sortOptions}
                            onChange={onChangeOpeningDate}
                        />
                        <SelectComponent
                            name="sortByDateMAJ"
                            label={t("dateUpdating")}
                            value={sortUpdatingDateIndex}
                            options={sortOptions}
                            onChange={onChangeUpdatingDate}
                        />
                    </div>
                </div>

                <div>
                    <p className="report-subTitle">{t("filterBy")}: </p>
                    <div className="filter-report__wrapper">
                        <SelectComponent
                            name="status"
                            label="Statut"
                            value={statusIndex}
                            defaultOption={t("selectOption")}
                            options={statusOptions}
                            onChange={setStatusIndex}
                        />
                        <SelectComponent
                            name="theme"
                            label="Thème"
                            value={themeIndex}
                            defaultOption={t("selectOption")}
                            options={themeOptions}
                            onChange={setThemeIndex}
                        />

                        <Input
                            className="filter-report__select"
                            label="Auteur"
                            nativeInputProps={{
                                name: "author",
                                type: "number",
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                defaultValue: currentFilters.author ?? "",
                            }}
                        />
                        <Input
                            className="filter-report__select"
                            label="Département"
                            nativeInputProps={{
                                placeholder: t("selectOption"),
                                name: "departement",
                                type: "number",
                                max: 2,
                                multiple: true,
                                defaultValue: currentFilters.departement ?? "",
                            }}
                        />
                    </div>
                </div>

                <div className="sumbit">
                    <Button type="submit" onClick={resetFiltersAndSort} priority="secondary">
                        {t("reset")}
                    </Button>
                    <Button type="submit" onClick={handleSubmit}>
                        {t("apply")}
                    </Button>
                </div>
            </form>
        </>
    );
};

export default FilterAndSortReport;
