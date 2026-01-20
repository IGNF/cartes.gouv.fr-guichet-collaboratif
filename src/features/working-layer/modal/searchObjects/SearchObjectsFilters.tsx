import { useCallback } from "react";
import GroupComponent from "./GroupComponent";
import { Group } from "@/constants/contributions/types";

import Button from "@codegouvfr/react-dsfr/Button";
import { useContributionStore } from "@/store";

interface Props {
    root: Group;
    setRoot: (group: Group) => void;
}

const SearchObjectsFilters: React.FC<Props> = ({ root, setRoot }) => {
    const { setSearchResult } = useContributionStore();
    const handleReset = useCallback(() => {
        setRoot({ ...root, operator: "ET", rules: [] });
        setSearchResult([]);
    }, [root, setRoot, setSearchResult]);

    return (
        <>
            <GroupComponent className="" group={root} onChange={setRoot} />
            <Button iconId="ri-refresh-line" priority="secondary" onClick={handleReset}>
                Réinitialiser
            </Button>
        </>
    );
};

export default SearchObjectsFilters;
