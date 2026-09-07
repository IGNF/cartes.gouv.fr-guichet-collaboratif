import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useReportStore } from "@/store";
import { PostThemeReport } from "@/constants/reports/types";
import { CommunityTheme } from "@/constants/communities/types";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";

interface ThemeProps {
    theme: CommunityTheme;
    themeAttributes: PostThemeReport;
    onChangeThemeAttributes?: (attributes: PostThemeReport) => void;
    readOnly?: boolean;
}

const ThemeForm: React.FC<ThemeProps> = ({ theme, themeAttributes, onChangeThemeAttributes, readOnly: readOnlyProp }) => {
    const { community } = useCommunityStore();
    const { isShowReport } = useReportStore();
    const readOnly = readOnlyProp ?? isShowReport();

    const { t } = useTranslation({ ThemeForm });

    const handleChange = (key: string, value: string) => {
        if (!onChangeThemeAttributes) return;
        onChangeThemeAttributes({
            ...themeAttributes,
            [key]: value,
        });
    };

    const communityTheme = community?.themes.find((t) => t.theme === theme.theme);

    if (!communityTheme?.attributes?.length) return null;

    return (
        <div className="report-theme-form">
            {communityTheme?.attributes?.map((item, index) => {
                const value = themeAttributes[item.name] ?? item.default;
                const isMissing = item.mandatory && !readOnly && value.trim() === "";
                const isInvalidInteger = !readOnly && value !== "" && !Number.isInteger(Number(value));

                switch (item.type) {
                    case "text":
                        return (
                            <Input
                                key={item.type + index}
                                textArea
                                label={item.name + (item.mandatory && !readOnly ? " *" : "")}
                                state={isMissing ? "error" : "default"}
                                stateRelatedMessage={isMissing ? t("mandatory_field") : ""}
                                hintText={readOnly ? "" : item.help}
                                disabled={readOnly}
                                nativeTextAreaProps={{
                                    required: !!item.mandatory && !readOnly,
                                    defaultValue: value,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                }}
                            />
                        );

                    case "integer":
                        return (
                            <Input
                                key={item.type + index}
                                label={item.name + (item.mandatory && !readOnly ? " *" : "")}
                                state={isMissing || isInvalidInteger ? "error" : "default"}
                                stateRelatedMessage={isMissing ? t("mandatory_field") : isInvalidInteger ? t("integer_status") : ""}
                                hintText={readOnly ? "" : item.help}
                                disabled={readOnly}
                                nativeInputProps={{
                                    required: !!item.mandatory && !readOnly,
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    type: "number",
                                    step: "1",
                                    defaultValue: value,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                }}
                            />
                        );

                    case "checkbox":
                        return (
                            <Checkbox
                                key={item.type + index}
                                options={[
                                    {
                                        label: item.name,
                                        hintText: readOnly ? "" : item.help,
                                        nativeInputProps: {
                                            checked: value === "1",
                                            onChange: (e) => {
                                                handleChange(item.name, e.target.checked ? "1" : "0");
                                            },
                                            disabled: readOnly,
                                        },
                                    },
                                ]}
                            />
                        );

                    case "list":
                        return (
                            <Select
                                key={item.type + index}
                                label={item.name + (item.mandatory && !readOnly ? " *" : "")}
                                state={isMissing ? "error" : "default"}
                                stateRelatedMessage={isMissing ? t("mandatory_field") : ""}
                                hint={readOnly ? "" : item.help}
                                disabled={readOnly}
                                nativeSelectProps={{
                                    required: !!item.mandatory && !readOnly,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                    defaultValue: value,
                                }}
                            >
                                <Fragment>
                                    <option disabled hidden value="">
                                        Selectionnez une option
                                    </option>
                                    {item.values?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Fragment>
                            </Select>
                        );

                    case "date":
                        return (
                            <Input
                                key={item.type + index}
                                label={item.name + (item.mandatory && !readOnly ? " *" : "")}
                                state={isMissing ? "error" : "default"}
                                stateRelatedMessage={isMissing ? t("mandatory_field") : ""}
                                hintText={readOnly ? "" : item.help}
                                disabled={readOnly}
                                nativeInputProps={{
                                    required: !!item.mandatory && !readOnly,
                                    type: "date",
                                    defaultValue: value,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                }}
                            />
                        );

                    case "double":
                        return (
                            <Input
                                key={item.type + index}
                                label={item.name + (item.mandatory && !readOnly ? " *" : "")}
                                state={isMissing ? "error" : "default"}
                                stateRelatedMessage={isMissing ? t("mandatory_field") : ""}
                                hintText={readOnly ? "" : item.help}
                                disabled={readOnly}
                                nativeInputProps={{
                                    required: !!item.mandatory && !readOnly,
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    type: "number",
                                    step: "0.001",
                                    defaultValue: value,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                }}
                            />
                        );

                    default:
                        return <Fragment key={item.type + index} />;
                }
            })}
        </div>
    );
};

export default ThemeForm;
