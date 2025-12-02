import { CommunityGeoservice, FeatureTypeColumn, FeatureTypeIds } from "@/constants/communities/types";
import { useMapStore } from "@/store";

import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { Upload } from "@codegouvfr/react-dsfr/Upload";

import { useEffect, useState, memo, useMemo, useCallback } from "react";
import { EventTypes } from "ol/Observable";
import WKT from "ol/format/WKT";
import { deleteFeatureById, editFeatureById } from "@/api/featureTypesData";

interface FeatureFormState {
    [key: string]: string | number | boolean | File[] | null;
}

interface PointDataProps {
    [key: string]: string | number | null;
}

interface ValidationErrors {
    [key: string]: string | null;
}

const EditFeatureTypeForm = () => {
    const { map, mapSwitcher, clickedMapFeature, setClickedMapFeature, setFeatureTypeMode, setWorkingLayerDrawerOpened } = useMapStore();

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get("featureTypeData"), [clickedMapFeature]);

    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get("geoservice"), [clickedMapFeature]);

    const columns: FeatureTypeColumn[] = useMemo(() => geoserviceData?.columns ?? [], [geoserviceData]);

    const [formData, setFormData] = useState<FeatureFormState>({});
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const featureLayer = useMemo(() => {
        if (!map || !geoserviceData) return null;
        return map
            .getLayers()
            .getArray()
            .find((l) => l.get("name") === geoserviceData.layer);
    }, [map, geoserviceData]);

    const handleCancel = useCallback(() => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode("view");
    }, [setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const handleLayerVisibility = useCallback(() => {
        if (featureLayer && !featureLayer?.getVisible()) {
            handleCancel();
        }
    }, [featureLayer, handleCancel]);

    useEffect(() => {
        if (!pointData) return;

        const initial: FeatureFormState = {};
        columns.forEach((col) => {
            if (!col.crs) {
                initial[col.name] = pointData[col.name] ?? col.default_value ?? "";
            }
        });
        setFormData(initial);
    }, [pointData, columns, mapSwitcher]);

    const validateField = (col: FeatureTypeColumn, value: string | number | boolean | File[] | null): string | null => {
        if (col.required && (value === null || value === "" || value === undefined)) {
            return "Ce champ est requis";
        }

        if (!col.nullable && (value === null || value === "")) {
            return "Ce champ ne peut pas être vide";
        }

        if (col.type.toLowerCase() === "string" && typeof value === "string") {
            if (col.min_length !== null && col.min_length !== undefined && value.length < col.min_length) {
                return `Minimum ${col.min_length} caractères requis`;
            }
            if (col.max_length !== null && col.max_length !== undefined && value.length > col.max_length) {
                return `Maximum ${col.max_length} caractères autorisés`;
            }
            if (col.pattern && value) {
                try {
                    const regex = new RegExp(`${col.pattern}`);
                    if (!regex.test(value)) {
                        return "Format invalide";
                    }
                } catch (e) {
                    console.error("Invalid regex pattern:", col.pattern, e);
                }
            }
        }

        if (col.type.toLowerCase() === "integer" && typeof value === "number") {
            if (col.min_value !== null && col.min_value !== undefined && value < col.min_value) {
                return `Valeur minimum: ${col.min_value}`;
            }

            if (col.max_value !== null && col.max_value !== undefined && value > col.max_value) {
                return `Valeur maximum: ${col.max_value}`;
            }
        }

        return null;
    };

    const updateField = (name: string, value: string | number | boolean | File[] | null, col: FeatureTypeColumn) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        const error = validateField(col, value);
        setValidationErrors((prev) => ({ ...prev, [name]: error }));
    };

    useEffect(() => {
        if (clickedMapFeature) {
            clickedMapFeature.set("selected", true);
            clickedMapFeature.changed();
        }
        return () => {
            if (clickedMapFeature) {
                clickedMapFeature.unset("selected");
                clickedMapFeature.changed();
            }
        };
    }, [clickedMapFeature, geoserviceData, featureLayer]);

    useEffect(() => {
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);

        return () => {
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, handleLayerVisibility);
        };
    }, [mapSwitcher, handleLayerVisibility]);

    const handleSave = async () => {
        try {
            const errors: ValidationErrors = {};
            columns.forEach((col) => {
                if (!col.crs) {
                    const error = validateField(col, formData[col.name]);
                    if (error) {
                        errors[col.name] = error;
                    }
                }
            });

            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                console.error("Validation errors:", errors);
                return;
            }

            const featureId = pointData?.id || pointData?.cleabs;
            if (!featureId) return;

            const database = featureLayer?.get("database");
            const table = featureLayer?.get("table");
            if (!database || !table) return;

            const featureTypesId: FeatureTypeIds = { database, table };

            const geometry = clickedMapFeature?.getGeometry();
            let wkt = "";

            if (geometry) {
                wkt = new WKT().writeGeometry(geometry.clone().transform("EPSG:3857", "EPSG:4326"));
            }

            const updated = await editFeatureById(
                featureTypesId,
                featureId,
                {
                    ...formData,
                    geometrie: wkt,
                },
                wkt
            );

            if (updated) {
                setClickedMapFeature(null);
                setWorkingLayerDrawerOpened(false);
                setFeatureTypeMode("view");
            } else {
                console.error("Save failed: update transaction failed.");
            }
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const featureId = pointData?.id || pointData?.cleabs;
            if (!featureId) return;

            const database = featureLayer?.get("database");
            const table = featureLayer?.get("table");
            if (!database || !table) return;

            const featureTypesId: FeatureTypeIds = {
                database,
                table,
            };

            const deleted = await deleteFeatureById(featureTypesId, featureId);

            if (deleted) {
                setClickedMapFeature(null);
                setWorkingLayerDrawerOpened(false);
                setFeatureTypeMode("view");
            } else {
                console.error("Retour code erreur, érronné");
            }
        } catch (error) {
            console.error("Suppression échouée", error);
        }
    };

    const dataColumns = useMemo(
        () =>
            columns
                .filter((col) => !col.crs)
                .map((col) => {
                    const v = formData[col.name];
                    const error = validationErrors[col.name];

                    const titleCell = col.description ? (
                        <Tooltip kind="hover" title={<span>{col.description}</span>}>
                            <span>
                                {col.title}
                                {col.required && <span style={{ color: "red" }}> *</span>}
                            </span>
                        </Tooltip>
                    ) : (
                        <span>
                            {col.title}
                            {col.required && <span style={{ color: "red" }}> *</span>}
                        </span>
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
                                valueCell = (
                                    <Input
                                        label=""
                                        state={error ? "error" : "default"}
                                        stateRelatedMessage={error || undefined}
                                        nativeInputProps={{
                                            value: (v as string) ?? "",
                                            onChange: (e) => updateField(col.name, e.target.value, col),
                                            required: col.required,
                                            minLength: col.min_length,
                                            maxLength: col.max_length,
                                            pattern: col.pattern,
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
                                            value: (v as string) ?? "",
                                            onChange: (e) => updateField(col.name, e.target.value, col),
                                            required: col.required,
                                        }}
                                    >
                                        <option value="">Sélectionnez une option</option>
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
                                            min: col.min_value,
                                            max: col.max_value,
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
        [columns, formData, validationErrors]
    );

    if (!pointData) return null;

    return (
        <>
            <div className="feature-type-form-header fr-flex fr-align-items--center">
                <h1 className="feature-type-form-title fr-text--lg">
                    {geoserviceData?.title} : {pointData.id || pointData.cleabs}
                </h1>

                <Button
                    iconId="ri-eye-fill"
                    className="feature-type-form-edit-button fr-icon--xl"
                    priority="tertiary no outline"
                    onClick={() => {
                        setFeatureTypeMode("view");
                    }}
                >
                    Retour
                </Button>
            </div>

            <Table bordered fixed className="feature-type-form-table" data={dataColumns} />

            <div className="feature-type-form-buttons">
                <div className="feature-type-form-actions-left">
                    <Button onClick={handleDelete} priority="primary" iconId="ri-delete-bin-line" iconPosition="right">
                        Supprimer
                    </Button>
                </div>

                <div className="feature-type-form-actions-right">
                    <Button priority="secondary" onClick={handleCancel}>
                        Annuler
                    </Button>

                    <Button priority="primary" onClick={handleSave} iconId="ri-save-line" iconPosition="right">
                        Sauvegarder
                    </Button>
                </div>
            </div>
        </>
    );
};

export default memo(EditFeatureTypeForm);
