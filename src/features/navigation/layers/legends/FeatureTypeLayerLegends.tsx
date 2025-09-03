import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import ParkingVeloImg from "../../../../img/parking_velo.png";
import "./FeatureTypeLayerLegends.css";
import { useCommunityStore } from "@/store";
import getWellKnownNames from "@/constants/wellKnownNames";

const defaultStyle = { value: "parking_par_defaut", name: "parking_par_defaut", styles: [{ title: "Par défaut", img: ParkingVeloImg }] };

const FeatureTypeLayerLegends = () => {
    const { communityLayers } = useCommunityStore();

    const legendTitle = document.querySelectorAll('div[id^="GPlayerInfoTitle-"]')[0]?.innerHTML;
    const currentLayer = communityLayers?.find((layer) => layer.type === "feature-type" && layer.geoservice.layer === legendTitle);

    const styles = currentLayer?.geoservice.styles;

    const [selectedStyle, setSelectedStyle] = useState(styles![0]?.name || "1");

    const currentStyle = styles?.find((style) => style.name === selectedStyle);

    return (
        <div className="feature-type-legends">
            <Select
                label="Style courant"
                nativeSelectProps={{
                    value: selectedStyle,
                    name: "feature_type_style",
                    onChange: (e) => {
                        setSelectedStyle(e.target.value);
                    },
                }}
            >
                <Fragment>
                    {styles?.map((style, index) => (
                        <option key={`feature-type-style-${index}`} value={style.name}>
                            {style.name}
                        </option>
                    ))}
                </Fragment>
            </Select>
            <div className="feature-type-list">
                {currentStyle?.types?.map((type, index) => (
                    <div key={`feature_type_${index}`}>
                        <div className="feature-type-image">
                            <img
                                src={(getWellKnownNames(type)[1] as HTMLImageElement).src}
                                alt={type.title}
                                width={type.pointRadius * 2}
                                height={type.pointRadius * 2}
                            />
                        </div>
                        <span>{type.title}</span>
                    </div>
                ))}
                {!currentStyle?.types?.length &&
                    defaultStyle?.styles?.map((style, index) => (
                        <div key={`feature_type_${index}`}>
                            <img src={style.img} alt={style.title} />
                            <span>{style.title}</span>
                        </div>
                    ))}
            </div>
            <div className="buttons">
                <Button onClick={(e) => console.log(e)}>Ok</Button>
                <Button priority="secondary" onClick={(e) => console.log(e)}>
                    Annuler
                </Button>
            </div>
        </div>
    );
};

export default FeatureTypeLayerLegends;
