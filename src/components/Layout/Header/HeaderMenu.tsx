import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { getLink, RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import useKeyEvent from "@/hooks/useKeyEvent";

type Item = PropsWithChildren<{
    iconId?: FrIconClassName | RiIconClassName;
    linkProps?: RegisteredLinkProps;
}>;

type HeaderMenuProps = {
    openButtonProps: Omit<ButtonProps, "linkProps" | "onClick" | "type">;
    actionButtonProps?: ButtonProps;
    items?: Item[];
    disabled?: boolean;
    headerContent?: ReactNode;
};

export default function HeaderMenu({ openButtonProps, actionButtonProps, items, disabled, headerContent }: HeaderMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const openBtnId = useId();
    const menuId = useId();

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeMenu();
            }
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

    const { Link } = getLink();

    return (
        <div className="header-menu" ref={containerRef}>
            <Button
                {...openButtonProps}
                iconId={openButtonProps?.iconId ?? "fr-icon-menu-2-fill"}
                nativeButtonProps={{
                    ...(openButtonProps?.nativeButtonProps ?? {}),
                    "aria-controls": isOpen ? menuId : undefined,
                    "aria-haspopup": "true",
                    "aria-expanded": isOpen ? "true" : undefined,
                }}
                className={`header-menu__open-button fr-text--sm ${openButtonProps?.className ?? ""}`}
                id={openBtnId}
                onClick={toggleMenu}
                type="button"
                size="small"
                disabled={disabled}
            >
                {openButtonProps.children}
                <span className="fr-icon--sm ri-arrow-down-s-line fr-ml-2v" aria-hidden="true" />
            </Button>

            {isOpen && (
                <div className="header-menu__positioner">
                    <div className="header-menu__paper" id={menuId}>
                        {headerContent && <div className="header-menu__header">{headerContent}</div>}
                        <ul className="fr-raw-list">
                            {items?.map(({ linkProps, iconId, children }, i) => {
                                const content = (
                                    <>
                                        {iconId && <span className={`fr-icon--sm ${iconId}`} />}
                                        {children}
                                    </>
                                );

                                const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                    closeMenu();
                                    linkProps?.onClick?.(e);
                                };

                                return (
                                    <li key={i} className={`header-menu__item ${!linkProps ? "header-menu__item--unclickable" : ""}`}>
                                        {linkProps ? (
                                            <Link {...linkProps} className="fr-text--sm" onClick={handleLinkClick}>
                                                {content}
                                            </Link>
                                        ) : (
                                            <span className="fr-text--sm">{content}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        {actionButtonProps !== undefined && (
                            <Button
                                {...actionButtonProps}
                                priority="tertiary"
                                size="small"
                                className={`header-menu__action-button fr-m-4v ${actionButtonProps.className ?? ""}`}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
