import {
    CONTACT_US_URL,
    DISCOVER_URL,
    EXPLORE_MAPS_URL,
    HELP_PRODUCER_GUIDE_URL,
    HELP_URL,
    PUBLISH_DATA_URL,
    SEARCH_DATA_URL,
    CREATE_DATA_URL,
} from "@/constants/urls";
import { useTranslation } from "@/i18n";
import { useOidc } from "@/oidc";
import { useUserStore } from "@/store/useUserStore";
import HeaderMenu from "./HeaderMenu";

export function HeaderMenuHelp() {
    const { t } = useTranslation({ HeaderMenus: HeaderMenuHelp });

    const newTabLinkProps = (href: string, title: string) => ({
        href,
        target: "_blank" as const,
        title: `${title} - ${t("new_window")}`,
    });

    return (
        <HeaderMenu
            openButtonProps={{ children: t("help"), iconId: "fr-icon-question-fill" }}
            items={[
                {
                    iconId: "fr-icon-question-mark",
                    children: t("question"),
                    linkProps: newTabLinkProps(HELP_URL, t("question")),
                },
                {
                    iconId: "fr-icon-book-2-line",
                    children: t("user_guide"),
                    linkProps: newTabLinkProps(HELP_PRODUCER_GUIDE_URL, t("user_guide")),
                },
                {
                    iconId: "fr-icon-mail-line",
                    children: t("contact_us"),
                    linkProps: newTabLinkProps(CONTACT_US_URL, t("contact_us")),
                },
            ]}
        />
    );
}

export function HeaderMenuServices() {
    const { t } = useTranslation({ HeaderMenus: HeaderMenuServices });

    return (
        <HeaderMenu
            openButtonProps={{ children: t("service"), iconId: "fr-icon-grid-fill" }}
            items={[
                { iconId: "fr-icon-road-map-line", children: t("explore"), linkProps: { href: EXPLORE_MAPS_URL } },
                { iconId: "fr-icon-search-line", children: t("search"), linkProps: { href: SEARCH_DATA_URL } },
                { iconId: "fr-icon-database-line", children: t("publish"), linkProps: { href: PUBLISH_DATA_URL } },
                { iconId: "fr-icon-brush-line", children: t("create"), linkProps: { href: CREATE_DATA_URL } },
            ]}
            actionButtonProps={{
                children: `${t("discover")} cartes.gouv.fr`,
                linkProps: { href: DISCOVER_URL, title: `${t("discover")} cartes.gouv.fr` },
            }}
        />
    );
}

export function HeaderMenuConnexion() {
    const { t } = useTranslation({ HeaderMenus: HeaderMenuConnexion });
    const { logout } = useOidc();
    const user = useUserStore((state) => state.user);

    const username = user?.name ?? t("account");

    return (
        <HeaderMenu
            openButtonProps={{ children: username, iconId: "fr-icon-account-circle-fill" }}
            items={[
                { iconId: "fr-icon-dashboard-3-line", children: t("board"), linkProps: { href: "/tableau-de-bord" } },
                { iconId: "fr-icon-user-line", children: t("account"), linkProps: { href: "/mon-compte" } },
            ]}
            actionButtonProps={{
                children: t("disconnect"),
                iconId: "fr-icon-logout-box-r-line",
                onClick: () => logout({ redirectTo: "home" }),
            }}
        />
    );
}
