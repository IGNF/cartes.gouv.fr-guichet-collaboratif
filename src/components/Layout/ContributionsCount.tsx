import { ComponentKey } from "@/i18n/types";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useState, useRef } from "react";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const buttonGroupRef = useRef<HTMLDivElement>(null);
    return (
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
    );
};

export default ContributionsCount;
