import { useState, useEffect, useCallback } from "react";
import { FeatureTypeColumn } from "@/constants/communities/types";
import { useContributionStore } from "@/store";
import { FeatureTypeMode } from "@/constants/contributions/types";

interface FeatureFormState {
    [key: string]: string | number | boolean | File[] | null;
}

export const useFeatureTypeForm = (
    pointData: Record<string, string | number | null> | null,
    columns: FeatureTypeColumn[],
    validateField: (col: FeatureTypeColumn, value: string | number | boolean | File[] | null) => string | null,
    setValidationErrors: (errors: Record<string, string | null> | ((prev: Record<string, string | null>) => Record<string, string | null>)) => void
) => {
    const [formData, setFormData] = useState<FeatureFormState>({});
    const { featureTypeMode, selectedObjects } = useContributionStore();

    const isMultipleEdit = featureTypeMode === FeatureTypeMode.EDIT && selectedObjects.length > 1;

    useEffect(() => {
        if (!pointData) return;

        const initial: FeatureFormState = {};
        columns.forEach((col) => {
            if (!col.crs) {
                const colValue = pointData[col.name] ?? col.default_value ?? "";
                initial[col.name] = isMultipleEdit ? "" : colValue;
            }
        });
        setFormData(initial);
    }, [pointData, columns, isMultipleEdit]);

    const updateField = useCallback(
        (name: string, value: string | number | boolean | File[] | null, col: FeatureTypeColumn) => {
            setFormData((prev) => ({ ...prev, [name]: value }));

            const error = validateField(col, value);
            setValidationErrors((prev: Record<string, string | null>) => ({ ...prev, [name]: error }));
        },
        [validateField, setValidationErrors]
    );

    return {
        formData,
        updateField,
    };
};
