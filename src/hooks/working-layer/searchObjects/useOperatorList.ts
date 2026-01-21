import { OperatorType } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";

const useOperatorList = () => {
    const { t } = useTranslation({ useOperatorList });
    const operatorList = [
        { value: OperatorType.in, title: t("in") },
        { value: OperatorType.not_in, title: t("not_in") },
        { value: OperatorType.is_empty, title: t("is_empty") },
        { value: OperatorType.is_not_empty, title: t("is_not_empty") },
        { value: OperatorType.equal, title: t("equal") },
        { value: OperatorType.not_equal, title: t("not_equal") },
        { value: OperatorType.begins_with, title: t("begins_with") },
        { value: OperatorType.not_begins_with, title: t("not_begins_with") },
        { value: OperatorType.contains, title: t("contains") },
        { value: OperatorType.not_contains, title: t("not_contains") },
        { value: OperatorType.ends_with, title: t("ends_with") },
        { value: OperatorType.not_ends_with, title: t("not_ends_with") },
        { value: OperatorType.is_null, title: t("is_null") },
        { value: OperatorType.is_not_null, title: t("is_not_null") },
        { value: OperatorType.less, title: t("less") },
        { value: OperatorType.less_or_equal, title: t("less_or_equal") },
        { value: OperatorType.greater, title: t("greater") },
        { value: OperatorType.greater_or_equal, title: t("greater_or_equal") },
        { value: OperatorType.between, title: t("between") },
        { value: OperatorType.not_between, title: t("not_between") },
    ];
    return operatorList;
};

export default useOperatorList;
