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
import { useEffect, useRef } from "react";

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
    const pointData: PointDataProps = clickedMapFeature?.get("featureTypeData");
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get("geoservice");

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
                lastMapFeatStyle.current = null;
            }
        };
    }, [clickedMapFeature, geoserviceData]);

    if (!pointData) return;

    const columns: FeatureTypeColumn[] = clickedMapFeature?.get("geoservice").columns || [];

    const handleCancel = () => {
        setFeatureTypeMode("view");
    };

    return (
        <>
            <div className="feature-type-form-header fr-flex fr-align-items--center">
                <h1 className="feature-type-form-title fr-text--lg">
                    {clickedMapFeature?.get("geoservice")?.title} : {pointData.id || pointData.cleabs}
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
            <>
                <Table
                    bordered
                    fixed
                    className="feature-type-form-table"
                    data={columns.map((col) => {
                        if (col.crs) return [];

                        const titleCell = col.description ? (
                            <Tooltip kind="hover" title={<span dangerouslySetInnerHTML={{ __html: col.description }} />}>
                                <span>{col.title}</span>
                            </Tooltip>
                        ) : (
                            <span>{col.title}</span>
                        );

                        const valueCell = (() => {
                            const colDefaultValue =
                                typeof col.default_value === "boolean" ? (col.default_value ? "true" : "false") : (col.default_value ?? undefined);

                            switch (col.type.toLowerCase()) {
                                case "string":
                                    return (
                                        <Input
                                            label=""
                                            nativeInputProps={{
                                                required: !col.nullable,
                                                defaultValue: colDefaultValue,
                                                value: pointData[col.name] ?? undefined,
                                            }}
                                        />
                                    );

                                case "integer":
                                    if (col.enum) {
                                        return (
                                            <Select
                                                label=""
                                                nativeSelectProps={{
                                                    required: !col.nullable,
                                                    defaultValue: colDefaultValue,
                                                    value: pointData[col.name] ?? undefined,
                                                }}
                                            >
                                                <option disabled hidden value="">
                                                    Sélectionnez une option
                                                </option>
                                                {col.enum.map((opt, idx) => (
                                                    <option key={idx} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </Select>
                                        );
                                    }
                                    return (
                                        <Input
                                            label=""
                                            nativeInputProps={{
                                                required: !col.nullable,
                                                defaultValue: colDefaultValue,
                                                value: pointData[col.name] ?? undefined,
                                            }}
                                        />
                                    );

                                case "boolean":
                                    return (
                                        <Checkbox
                                            options={[
                                                {
                                                    label: "",
                                                    nativeInputProps: {
                                                        checked: pointData[col.name] === "oui" ? true : !!col.default_value,
                                                    },
                                                },
                                            ]}
                                        />
                                    );

                                case "date":
                                    return (
                                        <Input
                                            label=""
                                            nativeInputProps={{
                                                required: !col.nullable,
                                                type: "date",
                                                defaultValue: colDefaultValue,
                                                value: pointData[col.name] ?? undefined,
                                            }}
                                        />
                                    );

                                case "document":
                                    return (
                                        <Upload
                                            label=""
                                            multiple
                                            className="upload-file"
                                            nativeInputProps={{
                                                defaultValue: colDefaultValue,
                                                accept: "*",
                                                value: pointData[col.name] ?? undefined,
                                            }}
                                        />
                                    );

                                default:
                                    return <></>;
                            }
                        })();

                        return [titleCell, <div className="feature-type-form-input-cell">{valueCell}</div>];
                    })}
                />
            </>

            <div className="feature-type-form-buttons">
                <Button priority="secondary" onClick={handleCancel}>
                    Annuler
                </Button>
            </div>
        </>
    );
};

export default EditFeatureTypeForm;
