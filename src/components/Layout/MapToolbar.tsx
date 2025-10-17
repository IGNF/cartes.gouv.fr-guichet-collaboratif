import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState, useRef } from "react";
import { useCommunityStore } from "@/store";

import "./MapToolbar.css";
import { useTranslation } from "@/i18n";

const MapToolbar: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const { community } = useCommunityStore();

    const { t } = useTranslation({ MapToolbar });

    if (!community) return null;

    return (
        <div id="map-toolbar-header" className="map-toolbar-container">
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
            <div>
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
                        <div className="map-toolbar-dropdown" style={{ width: buttonGroupRef.current?.offsetWidth ?? 40 }}>
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

                <Button iconId="fr-icon-settings-5-fill" priority="secondary" linkProps={{ href: "#" }} className="map-toolbar-manage">
                    {t("manage")}
                </Button>
            </div>
        </div>
    );
};

export default MapToolbar;
