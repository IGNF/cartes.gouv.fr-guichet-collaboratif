import { useReportStore } from "@/store";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useEffect } from "react";
import { useTranslation } from "@/i18n";
import FilterAndSortReport from "@/components/FilterAndSortReport";

const SearchReport = () => {
    const { setSearchReport, setCurrentPage } = useReportStore();
    const { t } = useTranslation({ FilterAndSortReport });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get("search") ?? "";
        setSearchReport(search);
    }, [setSearchReport]);

    const handleSearchReport = (value: string) => {
        setSearchReport(value);
        setCurrentPage(1);
    };
    return <SearchBar allowEmptySearch={true} onButtonClick={handleSearchReport} label={t("search_placeholder")} />;
};

export default SearchReport;
