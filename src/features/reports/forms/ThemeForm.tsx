import { useState } from "react";
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
}

const ThemeForm: React.FC<ThemeProps> = ({ theme, themeAttributes, onChangeThemeAttributes }) => {
    const [inputState, setinputState] = useState<boolean>(false);
    const { community } = useCommunityStore();
    const { isShowReport } = useReportStore();

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
                switch (item.type) {
                    case "text":
                        return (
                            <Input
                                key={item.type + index}
                                textArea
                                label={item.name + (item.mandatory && !isShowReport() ? " *" : "")}
                                state={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? "error" : "default"}
                                stateRelatedMessage={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? t("mandatory_field") : ""}
                                hintText={isShowReport() ? "" : item.help}
                                disabled={isShowReport()}
                                nativeTextAreaProps={{
                                    required: !!item.mandatory,
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
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
                                label={item.name + (item.mandatory ? " *" : "")}
                                state={(item.mandatory && !themeAttributes[item.name] && !isShowReport()) || !inputState ? "error" : "default"}
                                stateRelatedMessage={
                                    item.mandatory && !themeAttributes[item.name] && !isShowReport()
                                        ? t("mandatory_field")
                                        : !inputState
                                          ? t("integer_status")
                                          : ""
                                }
                                hintText={isShowReport() ? "" : item.help}
                                disabled={isShowReport()}
                                nativeInputProps={{
                                    required: !!item.mandatory,
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    type: "number",
                                    step: "1",
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
                                    onChange: (e) => {
                                        const numValue = Number(e.target.value);
                                        handleChange(item.name, e.target.value);
                                        setinputState(e.target.value === "" || Number.isInteger(numValue));
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
                                        hintText: isShowReport() ? "" : item.help,
                                        nativeInputProps: {
                                            checked: themeAttributes ? themeAttributes[item.name] === "1" : item.default === "1",
                                            onChange: (e) => {
                                                handleChange(item.name, e.target.checked ? "1" : "0");
                                            },
                                            disabled: isShowReport(),
                                        },
                                    },
                                ]}
                            />
                        );

                    case "list":
                        return (
                            <Select
                                key={item.type + index}
                                label={item.name + (item.mandatory ? " *" : "")}
                                hint={isShowReport() ? "" : item.help}
                                disabled={isShowReport()}
                                nativeSelectProps={{
                                    required: !!item.mandatory,
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
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
                                label={item.name + (item.mandatory ? " *" : "")}
                                state={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? "error" : "default"}
                                stateRelatedMessage={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? t("mandatory_field") : ""}
                                hintText={isShowReport() ? "" : item.help}
                                disabled={isShowReport()}
                                nativeInputProps={{
                                    required: !!item.mandatory,
                                    type: "date",
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
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
                                label={item.name + (item.mandatory ? " *" : "")}
                                state={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? "error" : "default"}
                                stateRelatedMessage={item.mandatory && !themeAttributes[item.name] && !isShowReport() ? t("mandatory_field") : ""}
                                hintText={isShowReport() ? "" : item.help}
                                disabled={isShowReport()}
                                nativeInputProps={{
                                    required: !!item.mandatory,
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    type: "number",
                                    step: "0.001",
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
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
