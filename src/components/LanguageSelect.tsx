import { languages, useLang } from "@/i18n";
import { languagesDisplayNames } from "@/i18n/types";
import { LanguageSelect as LanguageSelect_base } from "@codegouvfr/react-dsfr/LanguageSelect";

type Props = {
    id?: string;
};

export function LanguageSelect(props: Props) {
    const { id } = props;

    const { lang, setLang } = useLang();

    return <LanguageSelect_base id={id} supportedLangs={languages} lang={lang} setLang={setLang} fullNameByLang={languagesDisplayNames} />;
}
