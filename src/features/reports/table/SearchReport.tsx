import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";

const SearchReport = () => {
    const handleSearchReport = (word: string) => {
        console.log(word);
    };

    return <SearchBar big onButtonClick={handleSearchReport} />;
};

export default SearchReport;
