import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useReportStore } from "@/store";

const SearchReport = () => {
    const { setSearchReport, setCurrentPage } = useReportStore();

    const handleSearchReport = (value: string) => {
        setSearchReport(value.toLowerCase());
        setCurrentPage(1);
    };
    return <SearchBar allowEmptySearch={true} big onButtonClick={handleSearchReport} />;
};

export default SearchReport;
