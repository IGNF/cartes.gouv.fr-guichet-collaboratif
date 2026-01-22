import { useReportStore } from "@/store";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useEffect } from "react";

const SearchReport = () => {
    const { setSearchReport, setCurrentPage } = useReportStore();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get("search") || "";
        setSearchReport(search);
    }, []);

    const handleSearchReport = (value: string) => {
        setSearchReport(value);
        setCurrentPage(1);
    };
    return <SearchBar allowEmptySearch={true} onButtonClick={handleSearchReport} />;
};

export default SearchReport;
