import { useCallback, useState } from "react";
import GroupComponent from "./GroupComponent";
import { Group } from "@/constants/contributions/types";

import { createGroup } from "@/constants/contributions/utils";
import Button from "@codegouvfr/react-dsfr/Button";

const SearchObjectsFilters = () => {
    const [root, setRoot] = useState<Group>(() => createGroup());

    const handleReset = useCallback(() => {
        setRoot({ ...root, operator: "ET", rules: [] });
    }, [root]);

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
