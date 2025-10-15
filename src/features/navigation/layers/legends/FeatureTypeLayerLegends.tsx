import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import VectorLayer from "ol/layer/Vector";
import { useCommunityStore, useMapStore } from "@/store";
import getWellKnownNames from "@/constants/wellKnownNames";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { changeFeatureTypeStyle } from "@/constants/utils";
import "./FeatureTypeLayerLegends.css";
import { useTranslation } from "@/i18n";
import { LAYER_FEATURE_TYPE } from "@/constants";
import WebGLVectorLayer from "ol/layer/WebGLVector";

const FeatureTypeLayerLegends = () => {
    const { communityLayers } = useCommunityStore();
    const { map, featureTypeSelectedStyle, setFeatureTypeSelectedStyle } = useMapStore();

    const { t } = useTranslation({ FeatureTypeLayerLegends });

    const divLegendTitle = document.querySelectorAll('div[id^="GPlayerInfoTitle-"]')[0];
    const legendTitle = divLegendTitle?.innerHTML;
    const currentLayer = communityLayers?.find((layer) => layer.type === LAYER_FEATURE_TYPE && layer.geoservice.title === legendTitle);

    const currentLayerName = currentLayer?.geoservice.layer;
    const currentLayerStyle = featureTypeSelectedStyle.find((style) => style.layer === currentLayerName);
    const styles = currentLayer?.geoservice.styles;

    const [selectedStyle, setSelectedStyle] = useState(currentLayerStyle?.selectedStyle.name || styles![0]?.name || "1");

    const currentStyle = styles?.find((style) => style.name === selectedStyle);

    const layer = useMemo(() => map?.getAllLayers().find((l) => l.get("title") === legendTitle) as WebGLVectorLayer | VectorLayer, [map, legendTitle]);
    const layerFeatures = useMemo(() => layer?.getSource()?.getFeatures() || [], [layer]);

    useEffect(() => {
        const closeButton = divLegendTitle?.nextElementSibling;
        if (closeButton) {
            closeButton.setAttribute("title", t("close"));
        }
    }, [divLegendTitle, t]);

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
                label={t("select_label")}
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
                {currentStyle?.types?.map((type, index) => {
                    let imgSrc = type.logo;
                    let imgWidth = 50;
                    if (!imgSrc) {
                        imgSrc = (getWellKnownNames(type)[1] as HTMLImageElement).src;
                        if (type.pointRadius) imgWidth = type.pointRadius * 2;
                    }

                    return (
                        <div key={`feature_type_${index}`}>
                            <div className="feature-type-image">
                                <img src={imgSrc || undefined} alt={type.title} width={imgWidth} height={imgWidth} property="low" rel="preload" />
                            </div>
                            <span>{type.title}</span>
                        </div>
                    );
                })}
            </div>
            <div className="feature-type-buttons">
                <Button onClick={handleChange}>{t("yes")}</Button>
                <Button priority="secondary" onClick={handleCancel}>
                    {t("cancel")}
                </Button>
            </div>
        </div>
    );
};

export default FeatureTypeLayerLegends;
