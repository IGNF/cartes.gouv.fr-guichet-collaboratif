const useOperatorList = () => {
    const operatorList = [
        { value: "in", title: "est compris dans" },
        { value: "not_in", title: "n'est pas compris dans" },
        { value: "is_empty", title: "est vide" },
        { value: "is_not_empty", title: "n'est pas vide" },
        { value: "equal", title: "est égal à" },
        { value: "not_equal", title: "n'est pas égal à" },
        { value: "begins_with", title: "commence par" },
        { value: "not_begins_with", title: "ne commence pas par" },
        { value: "contains", title: "contient" },
        { value: "not_contains", title: "ne contient pas" },
        { value: "ends_with", title: "finit par" },
        { value: "not_ends_with", title: "ne finit pas par" },
        { value: "is_null", title: "est nul" },
        { value: "is_not_null", title: "n'est pas nul" },
    ];
    return operatorList;
};

export default useOperatorList;
