import React from "react";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Button from "@codegouvfr/react-dsfr/Button";
import { CommunityTheme } from "@/constants/communities/types";
import ThemeForm from "./ThemeForm";
import { PostThemeReport } from "@/constants/reports/types";
import { useTranslation } from "@/i18n";

interface Props {
    communityThemes: CommunityTheme[];
    selectedTheme: CommunityTheme | null;
    setSelectedTheme: (theme: CommunityTheme) => void;
    themeAttributes: PostThemeReport;
    onChangeThemeAttributes: (attributes: PostThemeReport) => void;
    errorTheme: string;
    editReport?: boolean;
    onSubmitTheme: () => Promise<void>;
    themeRef: React.RefObject<HTMLFieldSetElement | null>;
}

const ThemeComponent: React.FC<Props> = ({
    communityThemes,
    selectedTheme,
    setSelectedTheme,
    themeAttributes,
    onChangeThemeAttributes,
    errorTheme,
    editReport,
    onSubmitTheme,
    themeRef,
}) => {
    const { t } = useTranslation({ ThemeComponent });
    return (
        <>
            <RadioButtons
                ref={themeRef}
                legend={t("select_theme")}
                options={communityThemes.map((theme) => ({
                    label: theme.theme,
                    nativeInputProps: {
                        checked: selectedTheme?.theme === theme.theme,
                        onClick: () => {
                            setSelectedTheme(theme);
                            onChangeThemeAttributes({});
                        },
                        required: true,
                    },
                }))}
                state={errorTheme ? "error" : selectedTheme ? "success" : "default"}
                stateRelatedMessage={errorTheme ?? ""}
                orientation="horizontal"
                small
                className="theme-radio fr-mt-4v fr-mb-1v fr-text--md"
            />
            {selectedTheme && <ThemeForm theme={selectedTheme} themeAttributes={themeAttributes} onChangeThemeAttributes={onChangeThemeAttributes} />}
            {editReport && (
                <Button size="large" onClick={onSubmitTheme}>
                    {t("submit_theme")}
                </Button>
            )}
        </>
    );
};

export default ThemeComponent;
