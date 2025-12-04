import { useState, useCallback } from "react";
import { FeatureTypeColumn } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";

interface ValidationErrors {
    [key: string]: string | null;
}

export const useFeatureTypeValidation = () => {
    const { t } = useTranslation({ useFeatureTypeValidation });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const validateField = useCallback(
        (col: FeatureTypeColumn, value: string | number | boolean | File[] | null): string | null => {
            if (col.required && (value === null || value === "" || value === undefined)) {
                return t("error_required");
            }

            if (!col.nullable && (value === null || value === "")) {
                return t("error_required");
            }

            if (col.type.toLowerCase() === "string" && typeof value === "string") {
                if (col.min_length !== null && col.min_length !== undefined && value.length < col.min_length) {
                    return t("error_min_length");
                }
                if (col.max_length !== null && col.max_length !== undefined && value.length > col.max_length) {
                    return t("error_max_length");
                }
                if (col.pattern && value) {
                    try {
                        const regex = new RegExp(`^${col.pattern}$`);
                        if (!regex.test(value)) {
                            return t("error_pattern");
                        }
                    } catch (e) {
                        console.error("Invalid regex pattern:", col.pattern, e);
                    }
                }
            }

            if (col.type.toLowerCase() === "integer" && typeof value === "number") {
                if (col.min_value !== null && col.min_value !== undefined && value < col.min_value) {
                    return t("error_min_value");
                }
                if (col.max_value !== null && col.max_value !== undefined && value > col.max_value) {
                    return t("error_max_value");
                }
            }

            return null;
        },
        [t]
    );

    const validateAll = useCallback(
        (columns: FeatureTypeColumn[], formData: Record<string, string | number | boolean | File[] | null>): boolean => {
            const errors: ValidationErrors = {};
            columns.forEach((col) => {
                if (!col.crs) {
                    const error = validateField(col, formData[col.name]);
                    if (error) {
                        errors[col.name] = error;
                    }
                }
            });

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        },
        [validateField]
    );

    const clearErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        validationErrors,
        setValidationErrors,
        validateField,
        validateAll,
        clearErrors,
    };
};
