import LoaderComponent from "@/components/LoaderComponent";
import { CommunityTheme } from "@/constants/communities/types";
import { ClickedTool, ErrorFile, PostThemeReport, ReportTool } from "@/constants/reports/types";
import { useCommunityStore, useReportStore } from "@/store";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import ThemeForm from "./ThemeForm";
import { getThemeAttributes } from "@/constants/utils";
import DrawingForm from "./DrawingForm";
import { Feature } from "ol";
import CenterFeature from "../CenterFeature";
import { reportTools } from "@/constants/reports/utils";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ConfirmCancelModal from "./ConfirmCancelModal";
import AttachmentList from "./AttachmentList";

const confirmModal = createModal({
    id: "confirm-modal",
    isOpenedByDefault: false,
});

const allowedTypes = ["image/png", "image/jpg", "application/pdf"];
const maxSizeMB = 3;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

interface Props {
    handleSubmit: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, files: File[], features: Feature[]) => Promise<void>;
    handleDelete?: () => void;
    handleClose?: () => void;
}

const ReportForm: React.FC<Props> = ({ handleSubmit, handleDelete, handleClose }) => {
    const [selectedTheme, setSelectedTheme] = useState<CommunityTheme | null>(null);
    const [themeAttributes, setThemeAttributes] = useState<PostThemeReport>({});
    const [description, setDescription] = useState<string>("");
    const [filesUploaded, setFilesUploaded] = useState<File[]>([]);
    const [clickedTool, setClickedTool] = useState<ClickedTool>({ name: "", clicked: false });

    const [expendedDrawing, setExpendedDrawing] = useState<boolean>(false);
    const [expendedDescription, setExpendedDescription] = useState<boolean>(false);
    const [expendedDocument, setExpendedDocument] = useState<boolean>(false);

    const [errorTheme, setErrorTheme] = useState<string>("");
    const [errorFiles, setErrorFiles] = useState<ErrorFile[]>([]);

    const themeRef = useRef<HTMLFieldSetElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const { community } = useCommunityStore();
    const { selectedReport, selectedFeatures, setSelectedFeatures } = useReportStore();

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

    useEffect(() => {
        if (selectedReport) {
            setSelectedTheme(selectedReport?.themes[0]);
            setThemeAttributes(getThemeAttributes(selectedReport?.themes[0]));
            setDescription(selectedReport.comment ?? "");
        }
    }, [selectedReport]);

    const validateThemeAttributes = useCallback(
        (attributes: PostThemeReport) => {
            const communityTheme = community?.themes.find((t) => t.theme === selectedTheme?.theme);
            const errors: string[] = [];
            Object.keys(attributes).forEach((key) => {
                const item = communityTheme?.attributes.find((attr) => attr.name === key);
                const itemValue = attributes[key];
                if (item?.mandatory && !itemValue) {
                    errors.push(item.name);
                }
            });
            if (errors.length) {
                setErrorTheme(() => "Merci de remplir tous les champs obligatoire");
                themeRef?.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            } else {
                setErrorTheme(() => "");
            }
            return !errors.length;
        },
        [community, selectedTheme]
    );

    const validateTheme = useCallback(() => {
        if (!selectedTheme) {
            setErrorTheme(() => "Vous devez obligatoirement choisir un thème et ses attributs pour envoyer un signalement");
            themeRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            return false;
        } else {
            return validateThemeAttributes(themeAttributes);
        }
    }, [selectedTheme, themeAttributes, validateThemeAttributes]);

    const validateFiles = useCallback((files: File[]) => {
        const errors = [];
        if (files.length) {
            files.forEach((file: File) => {
                if (!allowedTypes.includes(file.type)) {
                    setErrorFiles((errorFiles) => [...errorFiles, { file, message: `Formats supportés : JPG, PNG, PDF` }]);
                    errors.push(file.name);
                    return;
                }

                if (file.size > maxSizeBytes) {
                    setErrorFiles((errorFiles) => [...errorFiles, { file, message: `Taille maximale : ${maxSizeMB} Mo.` }]);
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
    }, []);

    const onSubmit = async () => {
        handleToolClick(reportTools.find((tool) => tool.name === clickedTool.name));

        if (!validateTheme() || !validateFiles(filesUploaded)) {
            return;
        }
        if (!community || !selectedTheme) return;
        try {
            setLoading(true);
            await handleSubmit(selectedTheme, themeAttributes, description, filesUploaded, selectedFeatures);
            onClose();
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const onDelete = async () => {
        if (handleDelete) {
            try {
                setLoading(true);
                await handleDelete();
                onClose();
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        }
    };

    const onClose = () => {
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
                <h1 className="fr-mt-4v fr-mb-1v fr-text--md">{selectedReport ? `Signalement ${selectedReport.id}` : "Soumettre un signalement"}</h1>
                {!selectedReport && (
                    <p className={`fr-text--sm fr-mb-1v ${selectedFeatures && !selectedFeatures.length ? "fr-message--error" : ""}`}>
                        Si vous ne l’avez pas encore fait, localisez sur la carte l’endroit où effectuer un signalement, ou dessinez un croquis explicatif à cet
                        endroit.
                    </p>
                )}

                <RadioButtons
                    ref={themeRef}
                    legend="Choisir un thème *:"
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

                {selectedTheme && <ThemeForm theme={selectedTheme} themeAttributes={themeAttributes} onChangeThemeAttributes={onChangeThemeAttributes} />}

                <Accordion
                    label="Dessiner un croquis"
                    onExpandedChange={() => {
                        setExpendedDrawing(!expendedDrawing);
                    }}
                    expanded={expendedDrawing}
                >
                    <DrawingForm clickedTool={clickedTool} handleToolClick={handleToolClick} />
                </Accordion>
                <Accordion
                    label="Décrire le signalement"
                    onExpandedChange={() => {
                        setExpendedDescription(!expendedDescription);
                    }}
                    expanded={expendedDescription}
                >
                    <Input
                        label="Explicitez votre signalement de façon la plus détaillée possible :"
                        textArea
                        nativeTextAreaProps={{
                            value: description,
                            rows: 5,
                            onChange: (e) => {
                                setDescription(e.target.value);
                            },
                        }}
                    />
                </Accordion>

                <Accordion
                    label="Joindre des documents"
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
                            label="Aidez nous à comprendre votre signalement. Ajouter par exemple des photos ou autres documents pour préciser votre message."
                            hint={`Taille maximale : ${maxSizeMB} Mo. Formats supportés : JPG, PNG, PDF`}
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
                    </div>
                </Accordion>
                <div className="note">
                    <p>Si votre signalement ne concerne pas les thèmes ou données de ce guichet :</p>
                    <a href="http://" target="_blank" rel="noopener noreferrer">
                        Signalement hors guichet
                    </a>
                </div>

                {!selectedReport ? (
                    <div className="submit">
                        <Button size="large" onClick={onSubmit}>
                            Envoyer le signalement
                        </Button>
                        <Button nativeButtonProps={confirmModal.buttonProps} priority="tertiary no outline" title="Annuler">
                            Annuler
                        </Button>
                    </div>
                ) : (
                    <div className="buttons">
                        <Button priority="secondary" onClick={onDelete}>
                            Supprimer
                        </Button>
                        <Button priority="secondary" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button onClick={onSubmit}>Enregistrer</Button>
                    </div>
                )}
            </div>
            <CenterFeature />
            <ConfirmCancelModal modal={confirmModal} onClose={onClose} />
        </>
    );
};

export default ReportForm;
