import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import ParkingVeloImg from "../../../../img/parking_velo.png";
import "./FeatureTypeLayerLegends.css";
import { useCommunityStore, useMapStore } from "@/store";
import getWellKnownNames from "@/constants/wellKnownNames";
import VectorLayer from "ol/layer/Vector";
import { changeFeatureTypeStyle } from "@/constants/utils";

const defaultStyle = { value: "parking_velo_defaut", name: "parking_velo_defaut", styles: [{ title: "Par défaut", img: ParkingVeloImg }] };

const FeatureTypeLayerLegends = () => {
    const { communityLayers } = useCommunityStore();
    const { map, featureTypeSelectedStyle, setFeatureTypeSelectedStyle } = useMapStore();

    const divLegendTitle = document.querySelectorAll('div[id^="GPlayerInfoTitle-"]')[0];
    const legendTitle = divLegendTitle?.innerHTML;
    const currentLayer = communityLayers?.find((layer) => layer.type === "feature-type" && layer.geoservice.layer === legendTitle);
    const currentLayerName = currentLayer?.geoservice.layer;
    const currentLayerStyle = featureTypeSelectedStyle.find((style) => style.layer === currentLayerName);
    const styles = currentLayer?.geoservice.styles;

    const [selectedStyle, setSelectedStyle] = useState(currentLayerStyle?.selectedStyle.name || styles![0]?.name || "1");

    const currentStyle = styles?.find((style) => style.name === selectedStyle);

    const layer = useMemo(() => map?.getAllLayers().find((l) => l.get("title") === currentLayerName) as VectorLayer, [map, currentLayerName]);
    const layerFeatures = useMemo(() => layer?.getSource()?.getFeatures() || [], [layer]);
    const handleChange = () => {
        if (currentLayerName && currentStyle && map && currentLayerStyle?.selectedStyle.name !== currentStyle.name) {
            setFeatureTypeSelectedStyle({ layer: currentLayer?.geoservice.layer, selectedStyle: currentStyle });
            changeFeatureTypeStyle(layerFeatures, currentStyle);
        }
        handleCancel();
    };

    const handleCancel = () => {
        const closeButton = divLegendTitle?.nextElementSibling as HTMLButtonElement;
        if (closeButton) closeButton.click();
    };

    return (
        <div className="feature-type-legends">
            <Select
                label="Style courant : "
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
                {selectedStyle === "parking_velo_defaut"
                    ? defaultStyle?.styles?.map((style, index) => (
                          <div key={`feature_type_${index}`}>
                              <img src={style.img} alt={style.title} />
                              <span>{style.title}</span>
                          </div>
                      ))
                    : currentStyle?.types?.map((type, index) => (
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
            </div>
            <div className="buttons">
                <Button onClick={handleChange}>Ok</Button>
                <Button priority="secondary" onClick={handleCancel}>
                    Annuler
                </Button>
            </div>
        </div>
    );
};

export default FeatureTypeLayerLegends;
