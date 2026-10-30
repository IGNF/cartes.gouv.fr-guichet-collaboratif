import { useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import VectorLayer from "ol/layer/Vector";
import { useMapStore } from "@/store";
import getWellKnownNames from "@/constants/wellKnownNames";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { changeFeatureTypeStyle } from "@/constants/utils";
import { useTranslation } from "@/i18n";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { CommunityLayer, FeatureTypeStyleItem } from "@/constants/communities/types";
import { POLYGON_LINE_COLOR } from "@/constants/colors";

interface FeatureTypeLayerLegendsProps {
    communityLayer: CommunityLayer;
    onClose: () => void;
}

export default function FeatureTypeLayerLegends({ communityLayer, onClose }: FeatureTypeLayerLegendsProps) {
    const { map, featureTypeSelectedStyle, setFeatureTypeSelectedStyle } = useMapStore();

    const { t } = useTranslation({ FeatureTypeLayerLegends });

    const currentLayerName = communityLayer.geoservice.layer;
    const currentLayerStyle = featureTypeSelectedStyle.find((style) => style.layer === currentLayerName);
    const styles = communityLayer.geoservice.styles;

    const [selectedStyle, setSelectedStyle] = useState(currentLayerStyle?.selectedStyle.name || styles?.[0]?.name || "1");

    const currentStyle = styles?.find((style) => style.name === selectedStyle);

    const layer = useMemo(
        () => map?.getAllLayers().find((candidate) => candidate.get("name") === currentLayerName) as WebGLVectorLayer | VectorLayer,
        [currentLayerName, map]
    );
    const layerFeatures = useMemo(() => layer?.getSource()?.getFeatures() || [], [layer]);

    const handleChange = () => {
        if (currentLayerName && currentStyle && map && currentLayerStyle?.selectedStyle.name !== currentStyle.name) {
            setFeatureTypeSelectedStyle({ layer: currentLayerName, selectedStyle: currentStyle });
            changeFeatureTypeStyle(layerFeatures, currentStyle);
        }
        onClose();
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
                    } else if (type.logo) {
                        imgSrc = type.logo;
                        if (type.pointRadius) imgWidth = type.pointRadius * 2;
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
                <Button onClick={handleChange}>{t("apply")}</Button>
                <Button priority="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </div>
        </div>
    );
}
