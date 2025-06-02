import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Fragment } from "react/jsx-runtime";
import { CommunityTheme } from "@/constants/communities/types";
import { PostThemeReport } from "@/constants/reports/types";
import { useCommunityStore } from "@/store";

interface ThemeProps {
    theme: CommunityTheme;
    themeAttributes: PostThemeReport;
    onChangeThemeAttributes: (attributes: PostThemeReport) => void;
}

const ThemeForm: React.FC<ThemeProps> = ({ theme, themeAttributes, onChangeThemeAttributes }) => {
    const { community } = useCommunityStore();

    const handleChange = (key: string, value: string) => {
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
                                hintText={item.help}
                                label={item.name}
                                state="default"
                                stateRelatedMessage=""
                                nativeTextAreaProps={{
                                    defaultValue: themeAttributes ? (themeAttributes[item.name] ?? "") : item.default,
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
                                hintText={item.help}
                                label={item.name}
                                state="default"
                                stateRelatedMessage=""
                                nativeInputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    type: "number",
                                    step: "1",
                                    defaultValue: themeAttributes ? themeAttributes[item.name] : item.default,
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
                                        hintText: item.help,
                                        nativeInputProps: {
                                            checked: themeAttributes ? themeAttributes[item.name] === "1" : item.default === "1",
                                            onChange: (e) => {
                                                handleChange(item.name, e.target.checked ? "1" : "0");
                                            },
                                        },
                                    },
                                ]}
                            />
                        );

                    case "list":
                        return (
                            <Select
                                key={item.type + index}
                                hint={item.help}
                                label={item.name}
                                nativeSelectProps={{
                                    onChange: (e) => {
                                        handleChange(item.name, e.target.value);
                                    },
                                    defaultValue: themeAttributes[item.name] ?? item.default,
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
                                hintText={item.help}
                                label={item.name}
                                state="default"
                                stateRelatedMessage=""
                                nativeInputProps={{
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
                                hintText={item.help}
                                label={item.name}
                                state="default"
                                stateRelatedMessage=""
                                nativeInputProps={{
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
                        return <></>;
                }
            })}
        </div>
    );
};

export default ThemeForm;
