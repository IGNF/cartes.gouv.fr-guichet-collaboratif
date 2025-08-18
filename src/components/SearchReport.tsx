import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";

import useSearch from "@/hooks/useSearch";
import { useSearchParams } from "react-router-dom";

const SearchReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setSearchReport } = useSearch();
    const params = new URLSearchParams(searchParams);

    const handleSearchReport = (value: string) => {
        setSearchReport(value.toLowerCase());
        params.set("page", "1"); // go to initial page (page 1)
        params.set("search", value); // add a search param
        setSearchParams(params);
    };

    return <SearchBar big onButtonClick={handleSearchReport} />;
};

export default SearchReport;
