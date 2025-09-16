import { useReportStore } from "@/store";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";

const SearchReport = () => {
    const { setSearchReport, setCurrentPage } = useReportStore();

    const handleSearchReport = (value: string) => {
        setSearchReport(value.toLowerCase());
        setCurrentPage(1);
    };
    return <SearchBar allowEmptySearch={true} onButtonClick={handleSearchReport} defaultValue="" />;
};

export default SearchReport;
