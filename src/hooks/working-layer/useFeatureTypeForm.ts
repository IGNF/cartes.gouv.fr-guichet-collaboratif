import { useState, useEffect, useCallback, useRef } from "react";
import { FeatureTypeColumn } from "@/constants/communities/types";

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
    const prevPointDataRef = useRef<Record<string, string | number | null> | null>(null);

    useEffect(() => {
        if (!pointData) return;
        if (prevPointDataRef.current !== pointData) {
            const initial: FeatureFormState = {};
            columns.forEach((col) => {
                if (!col.crs) {
                    initial[col.name] = pointData[col.name] ?? col.default_value ?? "";
                }
            });
            setFormData(initial);
            prevPointDataRef.current = pointData;
        }
    }, [pointData, columns]);

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
