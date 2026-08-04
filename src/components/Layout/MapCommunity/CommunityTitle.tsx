import Button from "@codegouvfr/react-dsfr/Button";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useTranslation } from "@/i18n";
import { useCommunityStore } from "@/store/useCommunityStore";
import { BASE_URL } from "@/constants/urls";
import useKeyEvent from "@/hooks/useKeyEvent";

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
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useKeyEvent(
        "keydown",
        useCallback((event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        }, []),
        isOpen
    );

    if (!community) return null;

    const info = stripHtml(community.about || community.description);

    return (
        <div className="community-title-wrapper" ref={containerRef}>
            <div className="community-title-card">
                <img className="community-title-logo" src={community.logoUrl || `${BASE_URL}/img/placeholder.1x1.png`} alt={t("logo_alt")} />
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
                    disabled={!info}
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
