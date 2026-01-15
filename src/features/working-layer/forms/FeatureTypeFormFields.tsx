import { useCallback, useMemo } from "react";
import Table from "@codegouvfr/react-dsfr/Table";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FeatureTypeColumn } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";
import { useContributionStore } from "@/store";
import { FeatureTypeMode } from "@/constants/contributions/types";

interface FeatureTypeFormFieldsProps {
    columns: FeatureTypeColumn[];
    formData: Record<string, string | number | boolean | File[] | null>;
    validationErrors: Record<string, string | null>;
    updateField: (name: string, value: string | number | boolean | File[] | null, col: FeatureTypeColumn) => void;
}

export const FeatureTypeFormFields: React.FC<FeatureTypeFormFieldsProps> = ({ columns, formData, validationErrors, updateField }) => {
    const { selectedObjects, featureTypeMode, columnsToModify, setColumnsToModify } = useContributionStore();
    const { t } = useTranslation({ FeatureTypeFormFields });

    const showTitleCellCheckbox = useMemo(() => featureTypeMode === FeatureTypeMode.EDIT && selectedObjects.length > 1, [featureTypeMode, selectedObjects]);

    const handleCheckboxChange = useCallback(
        (column: FeatureTypeColumn, checked: boolean) => {
            if (checked) {
                setColumnsToModify([...columnsToModify, column]);
            } else {
                setColumnsToModify(columnsToModify.filter((col) => col.name !== column.name));
            }
        },
        [columnsToModify, setColumnsToModify]
    );

    const dataColumns = useMemo(
        () =>
            columns
                .filter((col) => !col.crs)
                .map((col) => {
                    const v = formData[col.name];
                    const error = validationErrors[col.name];

                    const titleName = (
                        <span>
                            {showTitleCellCheckbox && col.nullable ? (
                                <Checkbox
                                    options={[
                                        {
                                            label: col.title,
                                            nativeInputProps: {
                                                name: `${col.name}`,
                                                onChange: (e) => handleCheckboxChange(col, e.target.checked),
                                            },
                                        },
                                    ]}
                                    orientation="horizontal"
                                />
                            ) : (
                                col.title
                            )}
                            {col.required && <span style={{ color: "red" }}> *</span>}
                        </span>
                    );

                    const titleCell = col.description ? (
                        <Tooltip kind="hover" title={<span>{col.description}</span>}>
                            {titleName}
                        </Tooltip>
                    ) : (
                        titleName
                    );
                    let valueCell: React.ReactNode;

                    if (col.read_only) {
                        valueCell = (
                            <Input
                                label=""
                                nativeInputProps={{
                                    value: String(v ?? ""),
                                    disabled: true,
                                }}
                            />
                        );
                    } else {
                        switch (col.type.toLowerCase()) {
                            case "string":
                                valueCell = col.enum ? (
                                    <Select
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeSelectProps={{
                                            value: String(v ?? ""),
                                            onChange: (e) => updateField(col.name, e.target.value || null, col),
                                            required: col.required,
                                        }}
                                    >
                                        <option value="">{t("select_placeholder")}</option>
                                        {col.enum.map((opt, idx) => (
                                            <option key={idx} value={opt ?? ""}>
                                                {opt ?? t("select_placeholder")}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeInputProps={{
                                            value: (v as string) ?? "",
                                            onChange: (e) => updateField(col.name, e.target.value, col),
                                            required: col.required,
                                            minLength: col.min_length ?? undefined,
                                            maxLength: col.max_length ?? undefined,
                                            pattern: col.pattern ?? undefined,
                                        }}
                                    />
                                );
                                break;

                            case "integer":
                                valueCell = col.enum ? (
                                    <Select
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeSelectProps={{
                                            value: String(v ?? ""),
                                            onChange: (e) => updateField(col.name, e.target.value ? Number(e.target.value) : null, col),
                                            required: col.required,
                                        }}
                                    >
                                        <option value="">{t("select_placeholder")}</option>
                                        {col.enum.map((opt, idx) => (
                                            <option key={idx} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeInputProps={{
                                            type: "number",
                                            value: (v as number | string) ?? "",
                                            onChange: (e) => updateField(col.name, Number(e.target.value), col),
                                            required: col.required,
                                            min: col.min_value ?? undefined,
                                            max: col.max_value ?? undefined,
                                        }}
                                    />
                                );
                                break;

                            case "boolean":
                                valueCell = (
                                    <Checkbox
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        options={[
                                            {
                                                label: "",
                                                nativeInputProps: {
                                                    checked: Boolean(v),
                                                    onChange: (e) => updateField(col.name, e.target.checked, col),
                                                    required: col.required,
                                                },
                                            },
                                        ]}
                                    />
                                );
                                break;

                            case "date":
                                valueCell = (
                                    <Input
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeInputProps={{
                                            type: "date",
                                            value: (v as string) ?? "",
                                            onChange: (e) => updateField(col.name, e.target.value, col),
                                            required: col.required,
                                        }}
                                    />
                                );
                                break;

                            case "document":
                                valueCell = (
                                    <Upload
                                        label=""
                                        multiple
                                        className="upload-file"
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeInputProps={{
                                            onChange: (e) => updateField(col.name, Array.from(e.target.files ?? []), col),
                                            required: col.required,
                                        }}
                                    />
                                );
                                break;

                            default:
                                valueCell = <></>;
                        }
                    }

                    return [
                        titleCell,
                        <div className="feature-type-form-input-cell" key={col.name}>
                            {valueCell}
                        </div>,
                    ];
                }),
        [columns, formData, validationErrors, showTitleCellCheckbox, updateField, handleCheckboxChange, t]
    );

    return <Table bordered fixed className="feature-type-form-table" data={dataColumns} />;
};
