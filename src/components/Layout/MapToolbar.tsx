import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { fr } from "@codegouvfr/react-dsfr";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";

import "./MapToolbar.css";
import { useTranslation } from "@/i18n";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

const MapToolbar: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number>(0);
    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const { community, mapLayers, communityLayers } = useCommunityStore();
    const { mapWorkingLayer, setMapWorkingLayer } = useMapStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();

    const { t } = useTranslation({ MapToolbar });

    useEffect(() => {
        if (isDropdownOpen && buttonGroupRef.current) {
            setDropdownWidth(buttonGroupRef.current.offsetWidth);
        }
    }, [isDropdownOpen]);

    const reportLayer = useMemo(() => mapLayers.find((layer) => layer.name === REPORTS_LAYER_TYPE), [mapLayers]);
    const workingLayers = useMemo(() => {
        const layers = mapLayers
            ?.filter((l) => l !== reportLayer)
            .map((layer) => {
                const communityLayer = communityLayers?.find((lr) => lr.geoservice.layer === layer.name);
                return {
                    value: layer.name,
                    label: `${layer.title} ${communityLayer?.geoservice.readOnly ? `[${t("read_only")}]` : ""}`,
                };
            })
            .sort((l1, l2) => l1.label.localeCompare(l2.label));
        if (reportLayer) layers.push({ value: reportLayer?.name, label: reportLayer?.title });
        return layers;
    }, [mapLayers, reportLayer, communityLayers, t]);

    useEffect(() => {
        if (!mapWorkingLayer && workingLayers[0]) {
            let initWorkingLayer = localStorageData?.activeLayer;
            if (!initWorkingLayer) initWorkingLayer = workingLayers[0].value;
            setMapWorkingLayer(initWorkingLayer);
        }
    }, [mapWorkingLayer, workingLayers, localStorageData, setMapWorkingLayer]);

    const handleWorkingLayerChange = useCallback(
        (value: string) => {
            if (!community) return;
            if (community && localStorageData) {
                const newLocalData = { ...localStorageData, activeLayer: value };
                setLocalStorage(community?.name, newLocalData);
            }

            const mapLayer = mapLayers.find((layer) => layer.name === value);
            if (mapLayer && !mapLayer.source.getVisible()) {
                mapLayer.source.setVisible(true);
            }

            setMapWorkingLayer(value);
        },
        [community, localStorageData, mapLayers, setLocalStorage, setMapWorkingLayer]
    );

    if (!community) return null;

    return (
        <div id="map-toolbar-header" className="map-toolbar-container">
            <div className={`${fr.cx("fr-container")} map-toolbar-top`}>
                <div className="map-toolbar-header">
                    <div className="map-toolbar-left">
                        <div className="map-toolbar-title">
                            <img
                                src={
                                    community.logoUrl ||
                                    "https://media.istockphoto.com/id/528909900/photo/sunbeams-rays-of-light-shining-through-green-foliage-into-forest.webp?a=1&b=1&s=612x612&w=0&k=20&c=XvEKcyRQSLGgeTULTqy53TTuno_IevpN9VVUg3nXkjA="
                                }
                                alt="Icône Guichet"
                                className="map-toolbar-avatar"
                            />
                            <span className="map-toolbar-label">{t("community_title", { communityName: community.name })}</span>
                        </div>
                    </div>

                    <div className="map-toolbar-right">
                        <div ref={buttonGroupRef} className="map-toolbar-button-group">
                            <Button
                                iconId="fr-icon-save-fill"
                                priority="primary"
                                title={t("save_contributions", { contributionCount: null })}
                                onClick={() => {
                                    const event = new CustomEvent("save-view-button");
                                    document.dispatchEvent(event);
                                }}
                                className="map-toolbar-button-primary"
                            >
                                {t("save_contributions", { contributionCount: 2 })}
                            </Button>

                            <Button
                                iconId={isDropdownOpen ? `fr-icon-arrow-up-s-line` : `fr-icon-arrow-down-s-line`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                title={t("show_more")}
                                className="map-toolbar-button-toggle"
                            ></Button>

                            {isDropdownOpen && (
                                <div className="map-toolbar-dropdown" style={{ width: dropdownWidth }}>
                                    <div className="map-toolbar-line">{t("object_created", { count: 1 })}</div>
                                    <div className="map-toolbar-line">{t("object_modified", { count: 2 })}</div>
                                    <div className="map-toolbar-line">{t("object_deleted", { count: 0 })}</div>
                                    <div className="map-toolbar-review">
                                        <Button className="fr-btn fr-btn--tertiary map-toolbar-review-link">{t("review")}</Button>
                                    </div>
                                    <div className="map-toolbar-reset">
                                        <Button iconId="ri-refresh-line" priority="secondary">
                                            {t("reset")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button iconId="fr-icon-settings-5-fill" priority="primary" linkProps={{ href: "#" }}>
                            {t("manage")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={`map-toolbar-bottom-inner`}>
                <Select
                    label={t("working_layer")}
                    nativeSelectProps={{
                        value: mapWorkingLayer,
                        onChange: (e) => handleWorkingLayerChange(e.target.value),
                    }}
                    className="map-toolbar-bottom-select"
                >
                    {workingLayers?.map((option) => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </Select>
            </div>
        </div>
    );
};

export default MapToolbar;
