import { useMemo, useEffect, useState } from "react";
import { FeatureTypeColumn } from "@/constants/communities/types";
import { useUserStore, useMapStore } from "@/store";
import { AutomaticFieldType } from "@/constants/working-layer/types";
import { calculateAutomaticField } from "@/constants/working-layer/utils";
import { FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { useTranslation } from "@/i18n";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey } from "@/i18n/types";

interface FeatureTypeFormAutomaticProps {
    columns: FeatureTypeColumn[];
    formData: Record<string, string | number | boolean | File[] | null>;
    onAutomaticFieldsCalculated?: (fields: Record<string, string | number | null>) => void;
}

export const FeatureTypeFormAutomatic: React.FC<FeatureTypeFormAutomaticProps> = ({ columns, formData, onAutomaticFieldsCalculated }) => {
    const { user } = useUserStore();
    const { clickedMapFeature } = useMapStore();
    const [calculatedValues, setCalculatedValues] = useState<Record<string, string | number | null>>({});
    const [isCalculating, setIsCalculating] = useState(false);

    const { t } = useTranslation({ FeatureTypeFormAutomatic });
    const automaticColumns = useMemo(
        () =>
            columns.filter((col) => {
                return col.read_only && col.automatic;
            }),
        [columns]
    );

    useEffect(() => {
        if (!clickedMapFeature || automaticColumns.length === 0) return;

        const calculateFields = async () => {
            setIsCalculating(true);
            const geoservice = clickedMapFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
            const calculated: Record<string, string | number | null> = {};

            for (const col of automaticColumns) {
                const fieldType = (col.automatic || col.name) as AutomaticFieldType;

                if (Object.values(AutomaticFieldType).includes(fieldType)) {
                    const value = await calculateAutomaticField(fieldType, {
                        feature: clickedMapFeature,
                        userId: user?.id,
                        username: user?.username,
                        layerProjection: geoservice?.boxSrid,
                    });

                    if (value !== null) {
                        calculated[col.name] = value;
                    }
                }
            }

            setCalculatedValues(calculated);
            setIsCalculating(false);

            if (onAutomaticFieldsCalculated) {
                onAutomaticFieldsCalculated(calculated);
            }
        };

        calculateFields();
    }, [clickedMapFeature, automaticColumns, user, onAutomaticFieldsCalculated]);

    if (automaticColumns.length === 0) return null;

    return (
        <div className="feature-type-form-automatic">
            <div className="feature-type-form-automatic-list">
                {automaticColumns.map((col) => (
                    <div key={col.name} className="feature-type-form-automatic-item">
                        <span className="feature-type-form-automatic-label">{col.title}:</span>
                        <span className="feature-type-form-automatic-value">
                            {isCalculating ? (
                                <span className="calculating">{t("wait")}</span>
                            ) : (
                                formatValue(calculatedValues[col.name] ?? formData[col.name], col, t)
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const formatValue = (
    value: string | number | boolean | File[] | null,
    col: FeatureTypeColumn,
    t: TranslationFunction<"FeatureTypeFormAutomatic", ComponentKey>
): string => {
    if (value === null || value === undefined) {
        return t("empty");
    }

    switch (col.type.toLowerCase()) {
        case "boolean":
            return value ? t("yes") : t("no");
        case "date":
            return value ? new Date(value as string).toLocaleDateString() : t("empty");
        case "integer":
        case "number":
            return String(value);
        default:
            return String(value);
    }
};
