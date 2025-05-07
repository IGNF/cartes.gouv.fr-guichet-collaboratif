import { Button } from "@codegouvfr/react-dsfr/Button";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { fr } from "@codegouvfr/react-dsfr";
import { useState, useEffect, useRef } from "react";
import { useCommunityStore } from "@/store";

import "./MapToolbar.css";

const MapToolbar: React.FC = () => {
    const [selectedLayer, setSelectedLayer] = useState("Zones de sismicité");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number>(0);
    const buttonGroupRef = useRef<HTMLDivElement>(null);
    const { community } = useCommunityStore();

    useEffect(() => {
        if (isDropdownOpen && buttonGroupRef.current) {
            setDropdownWidth(buttonGroupRef.current.offsetWidth);
        }
    }, [isDropdownOpen]);

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
                            <span className="map-toolbar-label">Guichet - {community.name || "Aucun titre"}</span>
                        </div>
                    </div>

                    <div className="map-toolbar-right">
                        <div ref={buttonGroupRef} className="map-toolbar-button-group">
                            <Button
                                iconId="fr-icon-save-fill"
                                priority="primary"
                                title="Enregistrer vos contributions"
                                onClick={() => {
                                    const event = new CustomEvent("save-view-button");
                                    document.dispatchEvent(event);
                                }}
                                className="map-toolbar-button-primary"
                            >
                                Enregistrer vos contributions (1)
                            </Button>

                            <Button
                                iconId={isDropdownOpen ? `fr-icon-arrow-up-s-line` : `fr-icon-arrow-down-s-line`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                title="Afficher plus"
                                className="map-toolbar-button-toggle"
                            ></Button>

                            {isDropdownOpen && (
                                <div className="map-toolbar-dropdown" style={{ width: dropdownWidth }}>
                                    <div className="map-toolbar-line">
                                        Objets créés : <span className="map-toolbar-line-count">1</span>
                                    </div>
                                    <div className="map-toolbar-line">
                                        Objets supprimés : <span className="map-toolbar-line-count">0</span>
                                    </div>
                                    <div className="map-toolbar-line">
                                        Objets modifiés : <span className="map-toolbar-line-count">0</span>
                                    </div>
                                    <div className="map-toolbar-review">
                                        <Button className="fr-btn fr-btn--tertiary map-toolbar-review-link">
                                            Revoir vos objets créés et modifiés avant de les enregistrer
                                        </Button>
                                    </div>
                                    <div className="map-toolbar-reset">
                                        <Button iconId="ri-refresh-line" priority="secondary" onClick={() => console.log("Réinitialisation")}>
                                            Réinitialiser
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button iconId="fr-icon-settings-5-fill" priority="primary" linkProps={{ href: "#" }}>
                            Gérer le guichet
                        </Button>
                    </div>
                </div>
            </div>

            <div className="map-toolbar-bottom">
                <div className={`${fr.cx("fr-container")} map-toolbar-bottom-inner`}>
                    <div className="map-toolbar-layer-label">Couche de travail :</div>
                    <Select
                        label=""
                        nativeSelectProps={{
                            value: selectedLayer,
                            onChange: (e) => setSelectedLayer(e.target.value),
                        }}
                    >
                        <option>Zones de sismicité</option>
                        <option>Option 2</option>
                        <option>Option 3</option>
                        <option>Option 4</option>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default MapToolbar;
