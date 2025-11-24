import React from "react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { Feature } from "ol";
import { useGetReportReplies } from "@/api/repliesData";
import { useCommunityStore, useMapStore, useModalStore, useReportStore } from "@/store";
import { useReplyStore } from "@/store/useReplyStore";
import { CommunityTheme } from "@/constants/communities/types";
import { ClickedTool, ErrorFile, PostThemeReport, ReportTool } from "@/constants/reports/types";
import { getThemeAttributes } from "@/constants/utils";
import useReportTools from "@/hooks/reports/useReportTools";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import LoaderComponent from "@/components/LoaderComponent";
import ReportFiltersComponent from "@/components/ReportFiltersComponent";
import ThemeForm from "./ThemeForm";
import DrawingForm from "./DrawingForm";
import ConfirmCancelModal from "./ConfirmCancelModal";
import AttachmentList from "./AttachmentList";
import ReportTracking from "../ReportTracking";

const allowedTypes = ["image/png", "image/jpg", "application/pdf"];
const maxSizeMB = 3;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

interface Props {
    handleSubmit?: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, files: File[], features: Feature[]) => Promise<void>;
    handleSubmitSketch?: (theme: CommunityTheme, themeAttributes: PostThemeReport, features: Feature[]) => Promise<void>;
    handleSubmitTheme?: (theme: CommunityTheme, themeAttributes: PostThemeReport, features: Feature[]) => Promise<void>;
    handleSubmitDescription?: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, features: Feature[]) => Promise<void>;
    handleSubmitDocument?: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, files: File[], features: Feature[]) => Promise<void>;
    handleDelete?: () => void;
    handleClose?: () => void;
}

const ReportForm: React.FC<Props> = ({
    handleSubmit,
    handleDelete,
    handleSubmitTheme,
    handleSubmitSketch,
    handleSubmitDescription,
    handleSubmitDocument,
    handleClose,
}) => {
    const [selectedTheme, setSelectedTheme] = useState<CommunityTheme | null>(null);
    const [themeAttributes, setThemeAttributes] = useState<PostThemeReport>({});
    const [description, setDescription] = useState<string>("");
    const [filesUploaded, setFilesUploaded] = useState<File[]>([]);
    const [clickedTool, setClickedTool] = useState<ClickedTool>({ name: "", clicked: false });

    const [openSuivi, setOpenSuivi] = useState(false);
    const [committedStatus, setCommittedStatus] = useState("");

    const accordionRef = useRef<HTMLDivElement>(null);

    const [expendedDrawing, setExpendedDrawing] = useState<boolean>(false);
    const [expendedDescription, setExpendedDescription] = useState<boolean>(false);
    const [expendedDocument, setExpendedDocument] = useState<boolean>(false);

    const [errorTheme, setErrorTheme] = useState<string>("");
    const [errorFiles, setErrorFiles] = useState<ErrorFile[]>([]);

    const themeRef = useRef<HTMLFieldSetElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const { community } = useCommunityStore();
    const { setSelectedReport, reports, editReport, selectedReport, selectedFeatures, setSelectedFeatures, setTableDrawerOpened } = useReportStore();

    const reportTools = useReportTools();
    const { confirmCancelModal } = useModalStore();
    const { setClickedControl } = useMapStore();
    const { setReplies } = useReplyStore();

    const { t } = useTranslation({ ReportForm });

    const reportId = selectedReport?.id;

    const { data: repliesData } = useGetReportReplies(reportId);
    const repliesRes = useMemo(() => repliesData?.replies ?? [], [repliesData]);

    useEffect(() => {
        setSelectedReport(selectedReport);
    }, [reports, selectedReport, setSelectedReport]);

    const handleToolClick = useCallback((tool: ReportTool | undefined) => {
        if (!tool) return;
        const toolButton = document.querySelector(`button[id*="${tool.name}"]`) as HTMLButtonElement | null;
        if (toolButton) {
            toolButton.click();
            setClickedTool((prev) => {
                return { name: tool.name, clicked: prev.name === tool.name ? !prev.clicked : true };
            });
        }
    }, []);

    const validateThemeAttributes = useCallback(
        (attributes: PostThemeReport) => {
            const communityTheme = community?.themes.find((t) => t.theme === selectedTheme?.theme);
            const errors: string[] = [];
            if (communityTheme?.attributes.length && !Object.keys(attributes).length) {
                errors.push(t("all_fields_error"));
            }
            Object.keys(attributes).forEach((key) => {
                const item = communityTheme?.attributes.find((attr) => attr.name === key);
                const itemValue = attributes[key];
                if (item?.mandatory && !itemValue) {
                    errors.push(item.name);
                }
            });
            if (errors.length) {
                setErrorTheme(() => t("all_fields_error_message"));
                themeRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            } else {
                setErrorTheme(() => "");
            }
            return !errors.length;
        },
        [community, selectedTheme, t]
    );

    const validateTheme = useCallback(() => {
        if (!selectedTheme) {
            setErrorTheme(() => t("select_theme_error_message"));
            themeRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            return false;
        } else {
            return validateThemeAttributes(themeAttributes);
        }
    }, [selectedTheme, themeAttributes, validateThemeAttributes, t]);

    const validateFiles = useCallback(
        (files: File[]) => {
            const errors = [];
            if (files.length) {
                files.forEach((file: File) => {
                    if (!allowedTypes.includes(file.type)) {
                        setErrorFiles((errorFiles) => [...errorFiles, { file, message: t("import_file_error_message_type") }]);
                        errors.push(file.name);
                        return;
                    }

                    if (file.size > maxSizeBytes) {
                        setErrorFiles((errorFiles) => [...errorFiles, { file, message: t("import_file_error_message_size", { maxSizeMB }) }]);
                        errors.push(file.name);
                        return;
                    }
                });
            }

            if (!errors.length) {
                setErrorFiles([]);
            } else {
                filesRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
            return !errors.length;
        },
        [t]
    );

    useEffect(() => {
        if (selectedReport) {
            setSelectedTheme(selectedReport?.themes[0]);
            setThemeAttributes(getThemeAttributes(selectedReport?.themes[0]));
            setDescription(selectedReport.comment ?? "");
        }
    }, [selectedReport]);

    useEffect(() => {
        if (editReport) {
            validateThemeAttributes(themeAttributes);
        }
    }, [editReport, themeAttributes, validateThemeAttributes]);

    const onSubmit = async () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!validateTheme() || !validateFiles(filesUploaded)) {
            return;
        }
        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            if (handleSubmit) {
                await handleSubmit(selectedTheme, themeAttributes, description, filesUploaded, selectedFeatures);
            }
            onClose();
        } catch {
            setLoading(false);
        }
    };
    const onSubmitTheme = async () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!validateTheme()) {
            return;
        }
        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            if (handleSubmitTheme) {
                await handleSubmitTheme(selectedTheme, themeAttributes, selectedFeatures);
            }
            onClose();
        } catch {
            setLoading(false);
        }
    };

    const onSubmitSketch = async () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            if (handleSubmitSketch) {
                await handleSubmitSketch(selectedTheme, themeAttributes, selectedFeatures);
            }
            onClose();
        } catch {
            setLoading(false);
        }
    };

    const onSubmitDescription = async () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!validateTheme()) {
            return;
        }
        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            if (handleSubmitDescription) {
                await handleSubmitDescription(selectedTheme, themeAttributes, description, selectedFeatures);
            }
            onClose();
        } catch {
            setLoading(false);
        }
    };

    const onSubmitDocument = async () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!validateTheme() || !validateFiles(filesUploaded)) {
            return;
        }
        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            if (handleSubmitDocument) {
                await handleSubmitDocument(selectedTheme, themeAttributes, description, filesUploaded, selectedFeatures);
            }
            onClose();
        } catch {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (handleDelete) {
            try {
                setLoading(true);
                await handleDelete();
                onClose();
            } catch {
                setLoading(false);
            }
        }
    };

    const onClose = () => {
        if (clickedTool.clicked) handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));
        setSelectedTheme(null);
        setDescription("");
        setFilesUploaded([]);
        setExpendedDescription(false);
        setExpendedDocument(false);
        setErrorTheme(() => "");
        setErrorFiles([]);
        setLoading(false);
        setSelectedFeatures([]);

        if (handleClose) handleClose();

        setTableDrawerOpened(true);
        setClickedControl(null);
    };

    const removeFile = (file: File) => {
        const newFilesUploaded = filesUploaded?.filter((fileUploaded) => fileUploaded !== file);
        setFilesUploaded(newFilesUploaded);
        setErrorFiles(errorFiles.filter((error) => error.file !== file));
    };

    const onUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = [...filesUploaded];
            Array.from(files).forEach((file) => {
                if (!filesUploaded.find((f) => f === file)) {
                    newFiles.push(file);
                }
            });
            setFilesUploaded(newFiles);
            validateFiles(newFiles);
        }
    };

    const onChangeThemeAttributes = (attributes: PostThemeReport) => {
        validateThemeAttributes(attributes);
        setThemeAttributes(attributes);
    };

    if (!community) return;
    return (
        <>
            <div className="report-drawer">
                {loading && <LoaderComponent />}
                <h2 className="ri-map-pin-add-line fr-mt-4v fr-mb-1v fr-text--md">
                    {selectedReport ? t("edit_report_title", { reportId: selectedReport.id }) : t("create_report_title")}
                </h2>
                {selectedReport && <ReportFiltersComponent reportStatus={committedStatus} />}
                {!selectedReport && (
                    <p className={`fr-text--sm fr-mb-1v ${selectedFeatures && !selectedFeatures.length ? "fr-message--error" : ""}`}>
                        {t("localize_report_alert")}
                    </p>
                )}

                <Button
                    onClick={() => {
                        setOpenSuivi(true);
                        setTimeout(() => {
                            accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                    }}
                >
                    {t("report_reply")}
                </Button>
                <div className="fr-mt-12v">
                    <Accordion label={t("select_theme")} defaultExpanded={false}>
                        <RadioButtons
                            ref={themeRef}
                            legend={t("select_theme")}
                            options={community.themes.map((theme) => {
                                return {
                                    label: theme.theme,
                                    nativeInputProps: {
                                        checked: selectedTheme?.theme === theme.theme,
                                        onClick: () => {
                                            setSelectedTheme(theme);
                                            setThemeAttributes(getThemeAttributes(theme));

                                            setErrorTheme(() => "");
                                        },
                                        required: true,
                                    },
                                };
                            })}
                            state={errorTheme ? "error" : selectedTheme ? "success" : "default"}
                            stateRelatedMessage={errorTheme ?? ""}
                            orientation="horizontal"
                            small
                            className="theme-radio fr-mt-4v fr-mb-1v fr-text--md"
                        />
                        {selectedTheme && (
                            <ThemeForm theme={selectedTheme} themeAttributes={themeAttributes} onChangeThemeAttributes={onChangeThemeAttributes} />
                        )}

                        {editReport && (
                            <Button size="large" onClick={onSubmitTheme}>
                                {t("submit_theme")}
                            </Button>
                        )}
                    </Accordion>

                    <Accordion
                        label={t("draw_sketch")}
                        onExpandedChange={() => {
                            setExpendedDrawing(!expendedDrawing);
                        }}
                        expanded={expendedDrawing}
                    >
                        <DrawingForm clickedTool={clickedTool} handleToolClick={handleToolClick} />

                        {editReport && (
                            <Button size="large" onClick={onSubmitSketch}>
                                {t("submit_sketch")}
                            </Button>
                        )}
                    </Accordion>

                    <Accordion
                        label={t("describe_report")}
                        onExpandedChange={() => {
                            setExpendedDescription(!expendedDescription);
                        }}
                        expanded={expendedDescription}
                    >
                        <Input
                            label={t("describe_report_label")}
                            textArea
                            nativeTextAreaProps={{
                                value: description,
                                rows: 5,
                                onChange: (e) => {
                                    setDescription(e.target.value);
                                },
                            }}
                        />
                        {editReport && (
                            <Button size="large" onClick={onSubmitDescription}>
                                {t("submit_description")}
                            </Button>
                        )}
                    </Accordion>

                    <Accordion
                        label={t("import_attachments")}
                        onExpandedChange={() => {
                            setExpendedDocument(!expendedDocument);
                        }}
                        expanded={expendedDocument}
                    >
                        <div
                            style={{
                                width: "100%",
                            }}
                        >
                            <Upload
                                ref={filesRef}
                                label={t("import_attachments_label")}
                                hint={t("import_attachments_hint", { maxSizeMB })}
                                state={errorFiles.length ? "error" : filesUploaded.length ? "success" : "default"}
                                stateRelatedMessage=""
                                multiple
                                className="upload-file"
                                nativeInputProps={{
                                    value: "",
                                    accept: ".jpg,.png,.pdf",
                                    onChange: (e) => onUploadChange(e),
                                }}
                            />
                            <AttachmentList newFiles={filesUploaded} errorFiles={errorFiles} removeFile={removeFile} />
                            {editReport && (
                                <Button size="large" onClick={onSubmitDocument}>
                                    {t("submit_document")}
                                </Button>
                            )}
                        </div>
                    </Accordion>

                    <Accordion
                        ref={accordionRef}
                        label={t("report_tracking")}
                        onExpandedChange={(expanded: boolean) => {
                            setOpenSuivi(expanded);
                            if (expanded) {
                                setReplies(repliesRes);
                            }
                        }}
                        expanded={openSuivi}
                    >
                        <ReportTracking setCommittedStatus={setCommittedStatus} />
                    </Accordion>

                    {!selectedReport && t("report_note")}

                    {!selectedReport ? (
                        <div className="submit">
                            <Button size="large" onClick={onSubmit}>
                                {t("submit_report")}
                            </Button>
                            <Button nativeButtonProps={confirmCancelModal.buttonProps} priority="tertiary" title="Annuler">
                                {t("cancel_report")}
                            </Button>
                        </div>
                    ) : (
                        <div className="buttons">
                            <Button priority="secondary" onClick={onDelete}>
                                {t("delete_report")}
                            </Button>
                            <Button priority="secondary" onClick={onClose}>
                                {t("cancel_report")}
                            </Button>
                            <Button onClick={onSubmit}>{t("save_report")}</Button>
                        </div>
                    )}
                </div>
                <ConfirmCancelModal onClose={onClose} />
            </div>
        </>
    );
};

export default ReportForm;
