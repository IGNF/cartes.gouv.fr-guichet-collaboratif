import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import VectorLayer from "ol/layer/Vector";
import { useCommunityStore, useMapStore } from "@/store";
import getWellKnownNames from "@/constants/wellKnownNames";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { changeFeatureTypeStyle } from "@/constants/utils";
import { useTranslation } from "@/i18n";
import { LAYER_FEATURE_TYPE } from "@/constants";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { FeatureTypeStyleItem } from "@/constants/communities/types";
import { POLYGON_LINE_COLOR } from "@/constants/colors";

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

    const createLineSVG = (type: FeatureTypeStyleItem): string => {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", "50");
        svg.setAttribute("height", "12");

        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", "0");
        line.setAttribute("y1", "6");
        line.setAttribute("x2", "50");
        line.setAttribute("y2", "6");
        line.setAttribute("stroke", type.strokeColor ?? POLYGON_LINE_COLOR);
        line.setAttribute("stroke-width", String(type.strokeWidth ?? 2));
        line.setAttribute("stroke-opacity", String(type.strokeOpacity ?? 1));
        svg.appendChild(line);

        return `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
    };

    const createPolygonSVG = (type: FeatureTypeStyleItem): string => {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", "50");
        svg.setAttribute("height", "50");

        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", "1");
        rect.setAttribute("y", "1");
        rect.setAttribute("width", "48");
        rect.setAttribute("height", "48");
        rect.setAttribute("fill", type.fillColor ?? "none");
        rect.setAttribute("fill-opacity", String(type.fillOpacity ?? 0.4));
        rect.setAttribute("stroke", type.strokeColor ?? POLYGON_LINE_COLOR);
        rect.setAttribute("stroke-width", String(type.strokeWidth ?? 2));
        rect.setAttribute("stroke-opacity", String(type.strokeOpacity ?? 1));
        svg.appendChild(rect);

        return `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
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
                    let imgSrc: string | undefined;
                    let imgWidth = 50;
                    if (type.featureType === "line") {
                        imgSrc = createLineSVG(type);
                    } else if (type.featureType === "polygon") {
                        imgSrc = createPolygonSVG(type);
                    } else {
                        imgSrc = (getWellKnownNames(type)[1] as HTMLImageElement).src;
                        if (type.pointRadius) imgWidth = type.pointRadius * 2;
                    }
                    return (
                        <div key={`feature_type_${index}`}>
                            <div className="feature-type-image">
                                <img src={imgSrc || undefined} alt={type.title} width={imgWidth} property="low" rel="preload" />
                            </div>
                            <div className="feature-type-description">
                                <span>{type.title}</span>
                            </div>
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
