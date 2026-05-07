import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusMessage } from "@/constants/communities/types";
import { REPORT_STATUS_LIST, reportImgStatus } from "@/constants/utils";
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

    const [pendingStatus, setPendingStatus] = useState("");
    const [pendingTheme, setPendingTheme] = useState("");

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
            if (!community?.id) return Promise.resolve([]);
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
    const statusLabels = useMemo(() => statusOptions.map((status) => reportImgStatus[status]?.text ?? status), [statusOptions]);
    const themeOptions = useMemo(() => [...new Set(themes)], [themes]);
    const sortOptions = [t("newToOld"), t("oldToNew")];

    const statusIndex = useMemo(() => {
        const active = pendingStatus || currentFilters.status;
        if (!active) return -1;
        return statusOptions.indexOf(active);
    }, [pendingStatus, currentFilters.status, statusOptions]);

    const themeIndex = useMemo(() => {
        const active = pendingTheme || currentFilters.theme;
        if (!active) return -1;
        return themeOptions.indexOf(active);
    }, [pendingTheme, currentFilters.theme, themeOptions]);

    const sortOpeningDateIndex = useMemo(() => {
        if (!sortBy) return 0;
        const [field, order] = sortBy.split(":");
        if (field !== SortField.OpeningDate) return -1;
        return order === "DESC" ? 0 : 1;
    }, [sortBy]);

    const sortUpdatingDateIndex = useMemo(() => {
        if (!sortBy) return 0;
        const [field, order] = sortBy.split(":");
        if (field !== SortField.UpdatingDate) return -1;
        return order === "DESC" ? 0 : 1;
    }, [sortBy]);

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, t("loading_error"));
        }
    }, [isErrorReport, addAlertMessage, t]);

    const onChangeOpeningDate = (index: number) => {
        setSortBy(`opening_date:${index === 0 ? "DESC" : "ASC"}`);
    };

    const onChangeUpdatingDate = (index: number) => {
        setSortBy(`updating_date:${index === 0 ? "DESC" : "ASC"}`);
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const form = (e.target as HTMLButtonElement).form;
        if (!form) return;
        const formData = new FormData(form);
        setCurrentFilters({
            status: pendingStatus || statusOptions[statusIndex] || "",
            theme: pendingTheme || themeOptions[themeIndex] || "",
            author: Number(formData.get("author")) || null,
            departement: (formData.get("departement") as string) || "",
        });
        setFilteredReports(reports, true);
        setIsChecked({});
        syncUrlFromState();
    };

    const resetFiltersAndSort = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        formRef.current?.reset();

        setSortBy("");
        setPendingStatus("");
        setPendingTheme("");
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
                            label={t("status")}
                            value={statusIndex}
                            defaultOption={t("selectOption")}
                            options={statusLabels}
                            onChange={(i) => setPendingStatus(statusOptions[i] || "")}
                        />
                        <SelectComponent
                            name="theme"
                            label={t("theme")}
                            value={themeIndex}
                            defaultOption={t("selectOption")}
                            options={themeOptions}
                            onChange={(i) => setPendingTheme(themeOptions[i] || "")}
                        />
                        <Input
                            className="filter-report__select"
                            label={t("author")}
                            nativeInputProps={{
                                name: "author",
                                type: "number",
                                min: 1,
                                step: 1,
                                placeholder: t("author_placeholder"),
                                defaultValue: currentFilters.author ?? "",
                                onBlur: (e) => {
                                    e.currentTarget.value = String(parseInt(e.currentTarget.value, 10) || "");
                                },
                            }}
                        />
                        <Input
                            className="filter-report__select"
                            label={t("departement")}
                            nativeInputProps={{
                                placeholder: t("depatement_placeholder"),
                                name: "departement",
                                type: "text",
                                pattern: "^([02][1-9]|2[AB]|[1345678][0-9]|9[012345]|97[12346])$",
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
