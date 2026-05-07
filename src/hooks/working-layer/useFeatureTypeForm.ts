import { useState, useMemo, useCallback } from "react";
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
    const [formState, setFormState] = useState<{
        pointDataRef: Record<string, string | number | null> | null;
        columnsRef: FeatureTypeColumn[];
        isMultipleEditRef: boolean;
        values: FeatureFormState;
    }>({
        pointDataRef: null,
        columnsRef: [],
        isMultipleEditRef: false,
        values: {},
    });
    const { featureTypeMode, selectedObjects } = useContributionStore();

    const isMultipleEdit = featureTypeMode === FeatureTypeMode.EDIT && selectedObjects.length > 1;

    const baseFormData = useMemo(() => {
        if (!pointData) return {};

        const initial: FeatureFormState = {};
        columns.forEach((col) => {
            if (!col.crs) {
                const colValue = pointData[col.name] ?? col.default_value ?? "";
                initial[col.name] = isMultipleEdit ? "" : colValue;
            }
        });

        return initial;
    }, [pointData, columns, isMultipleEdit]);

    const isSameContext = formState.pointDataRef === pointData && formState.columnsRef === columns && formState.isMultipleEditRef === isMultipleEdit;

    const localValues = useMemo(() => (isSameContext ? formState.values : {}), [formState, isSameContext]);

    const formData = useMemo(() => ({ ...baseFormData, ...localValues }), [baseFormData, localValues]);

    const updateField = useCallback(
        (name: string, value: string | number | boolean | File[] | null, col: FeatureTypeColumn) => {
            setFormState((prev) => {
                const sameContext = prev.pointDataRef === pointData && prev.columnsRef === columns && prev.isMultipleEditRef === isMultipleEdit;
                const values = sameContext ? prev.values : {};

                return {
                    pointDataRef: pointData,
                    columnsRef: columns,
                    isMultipleEditRef: isMultipleEdit,
                    values: { ...values, [name]: value },
                };
            });

            const error = validateField(col, value);
            setValidationErrors((prev: Record<string, string | null>) => ({ ...prev, [name]: error }));
        },
        [pointData, columns, isMultipleEdit, validateField, setValidationErrors]
    );

    return {
        formData,
        updateField,
    };
};
