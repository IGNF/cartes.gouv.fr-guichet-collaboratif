import Button from "@codegouvfr/react-dsfr/Button";
import { useEffect, useId, useRef, useState } from "react";

import { useTranslation } from "@/i18n";
import { useCommunityStore } from "@/store/useCommunityStore";
import { BASE_URL } from "@/constants/urls";

const stripHtml = (html?: string) => (html ? (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "") : "");

export default function CommunityTitle() {
    const { t } = useTranslation({ CommunityTitle });
    const community = useCommunityStore((state) => state.community);

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const infoId = useId();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (!community) return null;

    const info = stripHtml(community.about || community.description);

    return (
        <div className="community-title-wrapper" ref={containerRef}>
            <div className="community-title-card">
                <img className="community-title-logo" src={community.logoUrl || `http:/${BASE_URL}/img/placeholder.1x1.png`} alt={t("logo_alt")} />
                <p className="community-title-name" title={community.name}>
                    {community.name}
                </p>
                <Button
                    iconId="fr-icon-information-line"
                    priority="tertiary no outline"
                    title={t("info_button_title")}
                    onClick={() => setIsOpen((prev) => !prev)}
                    nativeButtonProps={{
                        "aria-label": t("info_button_title"),
                        "aria-expanded": isOpen,
                        "aria-controls": isOpen ? infoId : undefined,
                    }}
                />
            </div>

            {isOpen && info && (
                <div className="community-title-info" id={infoId}>
                    {info}
                </div>
            )}
        </div>
    );
}
