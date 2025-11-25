import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { featureTypeSelectedLineStyle, featureTypeSelectedPointCircleStyle, featureTypeSelectedPolygonStyle } from "@/constants/styles";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Style } from "ol/style";
import { useEffect, useRef, useState, memo, useMemo } from "react";

interface FeatureFormState {
    [key: string]: string | number | boolean | File[] | null;
}

interface PointDataProps {
    [key: string]: string | number | null;
}

const getSelectedFeatureTypeStyle = (type: string) => {
    if (type === "point") return featureTypeSelectedPointCircleStyle();
    if (type === "line") return featureTypeSelectedLineStyle();
    if (type === "polygon") return featureTypeSelectedPolygonStyle();
    return featureTypeSelectedPointCircleStyle();
};

const EditFeatureTypeForm = () => {
    const { clickedMapFeature, setFeatureTypeMode } = useMapStore();

    const lastMapFeatStyle = useRef<Style | null>(null);

    const pointData: PointDataProps = useMemo(() => clickedMapFeature?.get("featureTypeData"), [clickedMapFeature]);

    const geoserviceData: CommunityGeoservice = useMemo(() => clickedMapFeature?.get("geoservice"), [clickedMapFeature]);

    const columns: FeatureTypeColumn[] = useMemo(() => clickedMapFeature?.get("geoservice")?.columns ?? [], [clickedMapFeature]);

    const [formData, setFormData] = useState<FeatureFormState>({});

    useEffect(() => {
        const initial: FeatureFormState = {};
        columns.forEach((col) => {
            if (!col.crs) {
                initial[col.name] = pointData[col.name] ?? col.default_value ?? "";
            }
        });
        setFormData(initial);
    }, [pointData, columns]);

    const updateField = (name: string, value: string | number | boolean | File[] | null) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (clickedMapFeature) {
            lastMapFeatStyle.current = clickedMapFeature.getStyle() as Style;
            clickedMapFeature.setStyle(getSelectedFeatureTypeStyle(geoserviceData?.featureType || "point"));
            clickedMapFeature.changed();
        }

        return () => {
            if (clickedMapFeature && lastMapFeatStyle.current) {
                clickedMapFeature.setStyle(lastMapFeatStyle.current);
                clickedMapFeature.changed();
            }
        };
    }, [clickedMapFeature, geoserviceData]);

    const handleCancel = () => {
        setFeatureTypeMode("view");
    };

    const handleSave = async () => {
        console.log("Saving feature type data...", formData);
        setFeatureTypeMode("view");
    };

    const handleDelete = async () => {
        const id = pointData.id || pointData.cleabs;
        console.log("TODO DELETE:", id);
        setFeatureTypeMode("view");
    };

    const dataColumns = useMemo(
        () =>
            columns
                .filter((col) => !col.crs)
                .map((col) => {
                    const titleCell = col.description ? (
                        <Tooltip
                            kind="hover"
                            title={
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: col.description,
                                    }}
                                />
                            }
                        >
                            <span>{col.title}</span>
                        </Tooltip>
                    ) : (
                        <span>{col.title}</span>
                    );

                    const v = formData[col.name];
                    let valueCell: React.ReactNode;

                    switch (col.type.toLowerCase()) {
                        case "string":
                            valueCell = (
                                <Input
                                    label=""
                                    nativeInputProps={{
                                        value: (v as string) ?? "",
                                        onChange: (e) => updateField(col.name, e.target.value),
                                    }}
                                />
                            );
                            break;

                        case "integer":
                            if (col.enum) {
                                valueCell = (
                                    <Select
                                        label=""
                                        nativeSelectProps={{
                                            value: (v as string) ?? "",
                                            onChange: (e) => updateField(col.name, e.target.value),
                                        }}
                                    >
                                        <option value="">Sélectionnez une option</option>
                                        {col.enum.map((opt, idx) => (
                                            <option key={idx} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </Select>
                                );
                            } else {
                                valueCell = (
                                    <Input
                                        label=""
                                        nativeInputProps={{
                                            type: "number",
                                            value: (v as number | string) ?? "",
                                            onChange: (e) => updateField(col.name, Number(e.target.value)),
                                        }}
                                    />
                                );
                            }
                            break;

                        case "boolean":
                            valueCell = (
                                <Checkbox
                                    options={[
                                        {
                                            label: "",
                                            nativeInputProps: {
                                                checked: Boolean(v),
                                                onChange: (e) => updateField(col.name, e.target.checked),
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
                                    nativeInputProps={{
                                        type: "date",
                                        value: (v as string) ?? "",
                                        onChange: (e) => updateField(col.name, e.target.value),
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
                                    nativeInputProps={{
                                        onChange: (e) => updateField(col.name, Array.from(e.target.files || [])),
                                    }}
                                />
                            );
                            break;

                        default:
                            valueCell = <></>;
                    }

                    return [
                        titleCell,
                        <div className="feature-type-form-input-cell" key={col.name}>
                            {valueCell}
                        </div>,
                    ];
                }),
        [columns, formData]
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
                    onClick={() => setFeatureTypeMode("view")}
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
