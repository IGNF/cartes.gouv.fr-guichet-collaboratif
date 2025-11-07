import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice, FeatureTypeColumn } from "@/constants/communities/types";
import { featureTypeSelectedLineStyle, featureTypeSelectedPointCircleStyle, featureTypeSelectedPolygonStyle } from "@/constants/styles";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Style } from "ol/style";
import { Fragment, useEffect, useRef } from "react";

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
    const { clickedMapFeature, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const lastMapFeatStyle = useRef<Style | null>(null);
    const pointData: PointDataProps = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);
    const geoserviceData: CommunityGeoservice = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
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
    }, [clickedMapFeature, geoserviceData, setWorkingLayerDrawerOpened]);

    const handleCancel = () => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
    };

    if (!pointData) return;

    const columns: FeatureTypeColumn[] = clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY).columns || [];
    return (
        <>
            <h1 className="fr-mt-4v fr-mb-1v fr-text--md">
                {clickedMapFeature?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.title} {pointData.id || pointData.cleabs}
            </h1>

            {columns.map((col, index) => {
                if (col.crs) return;
                const colDefaultValue = typeof col.default_value === "boolean" ? (col.default_value ? "true" : "false") : (col.default_value ?? undefined);
                switch (col.type.toLocaleLowerCase()) {
                    case "string":
                        return (
                            <Input
                                key={col.name + index}
                                label={col.title + (!col.nullable ? " *" : "")}
                                hintText={col.description}
                                disabled
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
                                    key={col.name + index}
                                    label={col.title + (!col.nullable ? " *" : "")}
                                    hint={col.description}
                                    disabled
                                    nativeSelectProps={{
                                        required: !col.nullable,
                                        defaultValue: colDefaultValue,
                                        value: pointData[col.name] ?? undefined,
                                    }}
                                >
                                    <Fragment>
                                        <option disabled hidden value="">
                                            Selectionnez une option
                                        </option>
                                        {col.enum?.map((option, idxOption) => (
                                            <option key={`${col.enum}_${idxOption}`} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </Fragment>
                                </Select>
                            );
                        }
                        return (
                            <Input
                                key={col.name + index}
                                label={col.title + (!col.nullable ? " *" : "")}
                                hintText={col.description}
                                disabled
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
                                key={col.name + index}
                                options={[
                                    {
                                        label: col.title,
                                        hintText: col.description,
                                        nativeInputProps: {
                                            checked: pointData[col.name] === "oui" ? true : !!col.default_value,
                                            disabled: true,
                                        },
                                    },
                                ]}
                            />
                        );

                    case "date":
                        return (
                            <Input
                                key={col.name + index}
                                label={col.title + (!col.nullable ? " *" : "")}
                                hintText={col.description}
                                disabled
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
                                key={col.name + index}
                                label={col.title}
                                hint={col.description}
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
            })}

            <div className="feature-type-form-buttons">
                <Button priority="secondary" onClick={handleCancel}>
                    Annuler
                </Button>
            </div>
        </>
    );
};

export default EditFeatureTypeForm;
