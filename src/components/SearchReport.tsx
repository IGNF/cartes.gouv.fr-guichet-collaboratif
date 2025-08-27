import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { useReportStore } from "@/store";

const SearchReport = () => {
    const { setSearchReport } = useReportStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSearchReport = (value: string) => {
        const params = new URLSearchParams(searchParams);
        setSearchReport(value.toLowerCase());
        params.set("page", "1");
        if (value.trim()) {
            params.set("search", value.toLowerCase());
        } else {
            params.delete("search");
        }
        setSearchParams(params);
        setSearchReport(value.toLowerCase());
    };
    return <SearchBar allowEmptySearch={true} big onButtonClick={handleSearchReport} />;
};

export default SearchReport;
