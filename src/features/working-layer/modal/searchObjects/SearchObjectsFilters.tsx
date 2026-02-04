import { useCallback } from "react";
import GroupComponent from "./GroupComponent";
import { Group, GroupOperator } from "@/constants/savedSearches/types";

import Button from "@codegouvfr/react-dsfr/Button";
import { useContributionStore } from "@/store";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey } from "@/i18n/types";

interface Props {
    t: TranslationFunction<"SearchObjectsModal", ComponentKey>;
    root: Group;
    setRoot: (group: Group) => void;
}

const SearchObjectsFilters: React.FC<Props> = ({ t, root, setRoot }) => {
    const { setSearchResult } = useContributionStore();
    const handleReset = useCallback(() => {
        setRoot({ ...root, operator: GroupOperator.ET, rules: [] });
        setSearchResult([]);
    }, [root, setRoot, setSearchResult]);

    return (
        <>
            <GroupComponent className="" group={root} onChange={setRoot} />
            <Button iconId="ri-refresh-line" priority="secondary" onClick={handleReset}>
                {t("reset")}
            </Button>
        </>
    );
};

export default SearchObjectsFilters;
