import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { fr } from "@codegouvfr/react-dsfr";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCommunityStore, useReportStore } from "@/store";

import "./MapToolbar.css";
import { useTranslation } from "@/i18n";

const MapToolbar: React.FC = () => {
    const [selectedLayer, setSelectedLayer] = useState("Zones de sismicité");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number>(0);
    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const { community } = useCommunityStore();
    const { tableDrawerOpened, setTableDrawerOpened } = useReportStore();

    const { t } = useTranslation({ MapToolbar });

    useEffect(() => {
        if (isDropdownOpen && buttonGroupRef.current) {
            setDropdownWidth(buttonGroupRef.current.offsetWidth);
        }
    }, [isDropdownOpen]);

    const toggleTableReportsDrawer = useCallback(() => {
        setTableDrawerOpened(!tableDrawerOpened);
    }, [tableDrawerOpened, setTableDrawerOpened]);

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
                                        <Button iconId="ri-refresh-line" priority="secondary" onClick={() => console.log("Réinitialisation")}>
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
                <Button iconId="ri-table-view" onClick={toggleTableReportsDrawer}>
                    {t("all_reports")}
                </Button>
                <Select
                    label={t("working_layer")}
                    nativeSelectProps={{
                        value: selectedLayer,
                        onChange: (e) => setSelectedLayer(e.target.value),
                    }}
                    className="map-toolbar-bottom-select"
                >
                    <option>{t("seismicity_zone")}</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                    <option>Option 4</option>
                </Select>
            </div>
        </div>
    );
};

export default MapToolbar;
