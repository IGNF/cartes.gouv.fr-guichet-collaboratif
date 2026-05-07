import React from "react";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
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
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import LoaderComponent from "@/components/LoaderComponent";
import ReportFiltersComponent from "@/components/ReportFiltersComponent";
import DrawingForm from "./DrawingForm";
import ConfirmCancelModal from "./ConfirmCancelModal";
import AttachmentList from "./AttachmentList";
import ReportTracking from "../ReportTracking";
import ThemeComponent from "./ThemeComponent";
import DeleteShareReportComponent from "../DeleteShareReportComponent";

const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
const maxSizeMB = 3;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

interface Props {
    handleSubmit?: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, files: File[], features: Feature[]) => Promise<void>;
    handleSubmitSketch?: (features: Feature[]) => Promise<void>;
    handleSubmitTheme?: (theme: CommunityTheme, themeAttributes: PostThemeReport) => Promise<void>;
    handleSubmitDescription?: (description: string) => Promise<void>;
    handleSubmitDocument?: (files: File[]) => Promise<void>;
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
    const { community } = useCommunityStore();

    const { editReport, selectedReport, selectedFeatures, setSelectedFeatures, setTableDrawerOpened, setDrawerOpened, toggleSortByDateCreation } =
        useReportStore();

    const [selectedTheme, setSelectedTheme] = useState<CommunityTheme | null>(selectedReport?.themes[0] ?? null);
    const [themeAttributes, setThemeAttributes] = useState<PostThemeReport>(() => {
        const initialTheme = selectedReport?.themes[0];
        return initialTheme ? getThemeAttributes(initialTheme) : {};
    });
    const [description, setDescription] = useState<string>(selectedReport?.comment ?? "");
    const [filesUploaded, setFilesUploaded] = useState<File[]>([]);

    const [openSuivi, setOpenSuivi] = useState(false);
    const [committedStatus, setCommittedStatus] = useState("");
    const [showTheme, setShowTheme] = useState<boolean>(false);
    const [themeInitial, setThemeInitial] = useState<CommunityTheme | null>(null);
    const [showDescription, setShowDescription] = useState<boolean>(false);
    const [, setDescriptionInitiale] = useState<string>("");
    const [showDocument, setShowDocument] = useState<boolean>(false);

    const accordionRef = useRef<HTMLDivElement>(null);

    const [expendedTheme, setExpendedTheme] = useState<boolean>(true);
    const [expendedDrawing, setExpendedDrawing] = useState<boolean>(false);
    const [expendedDescription, setExpendedDescription] = useState<boolean>(false);
    const [expendedDocument, setExpendedDocument] = useState<boolean>(false);

    const [errorTheme, setErrorTheme] = useState<string>("");
    const [errorFiles, setErrorFiles] = useState<ErrorFile[]>([]);

    const themeRef = useRef<HTMLFieldSetElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const reportTools = useReportTools();
    const { confirmCancelModal } = useModalStore();
    const { setClickedControl, clickedTool, setClickedTool } = useMapStore();
    const { setReplies } = useReplyStore();

    const { t } = useTranslation({ ReportForm });

    const reportId = selectedReport?.id;

    const { data: repliesData } = useGetReportReplies(reportId);
    const repliesRes = useMemo(() => repliesData?.replies ?? [], [repliesData]);

    const handleToolClick = useCallback(
        (tool: ReportTool | undefined) => {
            if (!tool) return;

            const toolButton = document.querySelector(`button[id*="${tool.name}"]`) as HTMLButtonElement | null;
            if (toolButton) {
                toolButton.click();
            }

            const nextClicked: ClickedTool = {
                name: tool.name,
                clicked: clickedTool?.name === tool.name ? !clickedTool.clicked : true,
            };

            setClickedTool(nextClicked);
        },
        [setClickedTool, clickedTool]
    );

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

    const onSubmit = async () => {
        toggleSortByDateCreation("DESC");
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
        if (!validateTheme()) {
            return;
        }
        if (!community || !selectedTheme) return;
        setLoading(true);
        try {
            if (handleSubmitTheme) {
                await handleSubmitTheme(selectedTheme, themeAttributes);
                setLoading(false);
            }
        } catch {
            setLoading(false);
        }
    };

    const onSubmitSketch = async () => {
        if (!community || !selectedTheme) return;
        setLoading(true);
        try {
            if (handleSubmitSketch) {
                await handleSubmitSketch(selectedFeatures);
                setLoading(false);
            }
        } catch {
            setLoading(false);
        }
    };

    const onSubmitDescription = async () => {
        if (!validateTheme()) {
            return;
        }
        if (!community || !selectedTheme) return;
        setLoading(true);
        try {
            if (handleSubmitDescription) {
                await handleSubmitDescription(description);
                setLoading(false);
            }
        } catch {
            setLoading(false);
        }
    };

    const onSubmitDocument = async () => {
        if (!validateTheme() || !validateFiles(filesUploaded)) {
            return;
        }
        if (!community || !selectedTheme) return;
        setLoading(true);
        try {
            if (handleSubmitDocument) {
                await handleSubmitDocument(filesUploaded);
                setFilesUploaded([]);
            }
            setLoading(false);
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
        setSelectedTheme(null);
        setDescription("");
        setFilesUploaded([]);
        setExpendedTheme(false);
        setExpendedDescription(false);
        setExpendedDocument(false);
        setErrorTheme(() => "");
        setErrorFiles([]);
        setLoading(false);
        setSelectedFeatures([]);

        if (handleClose) handleClose();

        if (editReport) setTableDrawerOpened(true);
        setDrawerOpened(false);
        setClickedControl(null);
    };

    const onToggleTheme = () => {
        if (!showTheme) {
            setShowTheme(true);
            setThemeInitial(selectedTheme);
        } else {
            setSelectedTheme(themeInitial);
            setShowTheme(false);
            setExpendedTheme(false);
            setErrorTheme(() => "");
        }
    };
    const onToggleDescription = () => {
        if (!showDescription) {
            setDescriptionInitiale(description);
            setShowDescription(true);
        } else {
            setShowDescription(false);
            setExpendedDescription(false);
        }
    };

    const onToggleDocument = () => {
        if (!showDocument) {
            setShowDocument(true);
        } else {
            setExpendedDocument(false);
            setShowDocument(false);
            setErrorFiles([]);
        }
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
                <div className="report-drawer__container">
                    <h2 className="ri-map-pin-add-line fr-mt-4v fr-mb-1v fr-text--md">
                        {selectedReport ? t("edit_report_title", { reportId: selectedReport.id }) : t("create_report_title")}
                    </h2>
                    {editReport && <DeleteShareReportComponent handleDelete={onDelete} />}
                </div>
                {selectedReport && <ReportFiltersComponent reportStatus={committedStatus} />}
                {!selectedReport && (
                    <p className={`fr-text--sm fr-mb-1v ${selectedFeatures && !selectedFeatures.length ? "fr-message--error" : ""}`}>
                        {t("localize_report_alert")}
                    </p>
                )}

                {editReport && (
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
                )}
                <div className="fr-mt-12v">
                    <Accordion
                        label={t("select_theme")}
                        onExpandedChange={() => {
                            setExpendedTheme(!expendedTheme);
                        }}
                        expanded={expendedTheme}
                    >
                        <>
                            <h3 className="fr-text--md fr-mb-1v">
                                {selectedTheme ? selectedTheme.theme : selectedReport?.themes.map((theme) => theme.theme).join(", ")}
                            </h3>
                            {editReport && !showTheme && (
                                <Button className="fr-mt-4v" onClick={() => onToggleTheme()}>
                                    {t("show_toEdit")}
                                </Button>
                            )}
                        </>
                        {(showTheme || !editReport) && (
                            <ThemeComponent
                                communityThemes={community.themes}
                                selectedTheme={selectedTheme}
                                setSelectedTheme={setSelectedTheme}
                                themeAttributes={themeAttributes}
                                onChangeThemeAttributes={onChangeThemeAttributes}
                                errorTheme={errorTheme}
                                editReport={editReport}
                                onSubmitTheme={onSubmitTheme}
                                themeRef={themeRef}
                            />
                        )}
                        {showTheme && (
                            <div className="report__actions">
                                {editReport && showTheme && <Button onClick={onSubmitTheme}>{t("save_report")}</Button>}
                                <Button priority="secondary" onClick={onToggleTheme}>
                                    {showTheme ? t("hide_toEdit") : editReport ? t("show_toEdit") : t("show_toCreate")}
                                </Button>
                            </div>
                        )}
                    </Accordion>

                    <Accordion
                        label={t("draw_sketch")}
                        onExpandedChange={() => {
                            setExpendedDrawing(!expendedDrawing);
                        }}
                        expanded={expendedDrawing}
                    >
                        <DrawingForm
                            clickedTool={clickedTool}
                            handleToolClick={handleToolClick}
                            onSubmitSketch={onSubmitSketch}
                            expendedDrawing={expendedDrawing}
                            hideToolsDiv={false}
                        />
                    </Accordion>

                    <Accordion
                        label={t("describe_report")}
                        onExpandedChange={() => {
                            setExpendedDescription(!expendedDescription);
                        }}
                        expanded={expendedDescription}
                    >
                        {description && editReport ? <h3 className="fr-text--md fr-mb-1v">{description}</h3> : <p> {t("no_description")} </p>}
                        {editReport && !showDescription && (
                            <Button className="fr-mt-4v" onClick={() => onToggleDescription()}>
                                {showDescription
                                    ? t("hide_toEdit")
                                    : editReport && selectedReport && selectedReport.comment
                                      ? t("show_toEdit")
                                      : t("show_toCreate")}
                            </Button>
                        )}

                        {(showDescription || !editReport) && (
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
                        )}
                        <div className="report__actions">
                            {editReport && showDescription && <Button onClick={onSubmitDescription}>{t("submit_report")}</Button>}
                            <Button priority="secondary" onClick={onToggleDescription}>
                                {showDescription ? t("hide_toEdit") : editReport ? t("show_toEdit") : t("show_toCreate")}
                            </Button>
                        </div>
                    </Accordion>

                    <Accordion
                        label={t("import_attachments")}
                        onExpandedChange={() => {
                            setExpendedDocument(!expendedDocument);
                        }}
                        expanded={expendedDocument}
                    >
                        <div>
                            <AttachmentList newFiles={filesUploaded} errorFiles={errorFiles} removeFile={removeFile} showDocument={showDocument} />

                            {editReport && !showDocument && (
                                <Button className="fr-mt-4v" onClick={() => onToggleDocument()}>
                                    {selectedReport && selectedReport.attachments.length > 0 ? t("show_toEdit") : t("show_toCreate")}
                                </Button>
                            )}
                            {(showDocument || !editReport) && (
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
                            )}
                            {showDocument && (
                                <>
                                    <div className="report__actions">
                                        {editReport && <Button onClick={onSubmitDocument}>{t("submit_report")}</Button>}
                                        <Button priority="secondary" onClick={() => onToggleDocument()}>
                                            {showDocument ? t("hide_toEdit") : editReport ? t("show_toEdit") : t("show_toCreate")}
                                        </Button>
                                    </div>
                                </>
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

                    {!selectedReport && (
                        <div className="submit">
                            <Button onClick={onSubmit}>{t("submit_report")}</Button>
                            <Button nativeButtonProps={confirmCancelModal.buttonProps} priority="tertiary" title="Annuler">
                                {t("cancel_report")}
                            </Button>
                        </div>
                    )}
                </div>
                <ConfirmCancelModal onClose={onClose} />
            </div>
        </>
    );
};

export default ReportForm;
