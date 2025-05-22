import LoaderComponent from "@/components/LoaderComponent";
import { CommunityTheme } from "@/constants/communities/types";
import { CommunityReport, ErrorFile, PostThemeReport } from "@/constants/reports/types";
import { useCommunityStore } from "@/store";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { ChangeEvent, useEffect, useState } from "react";
import ReportAttachments from "./ReportAttachments";
import ThemeForm from "./ThemeForm";
import { getThemeAttributes } from "@/constants/utils";

const allowedTypes = ["image/png", "image/jpg", "application/pdf"];
const maxSizeMB = 3;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

interface Props {
    selectedReport?: CommunityReport;
    handleSubmit: (theme: CommunityTheme, themeAttributes: PostThemeReport, description: string, files: File[]) => Promise<void>;
    handleDelete?: () => void;
    handleClose?: () => void;
}

const ReportForm: React.FC<Props> = ({ selectedReport, handleSubmit, handleDelete, handleClose }) => {
    const [selectedTheme, setSelectedTheme] = useState<CommunityTheme | null>(null);
    const [themeAttributes, setThemeAttributes] = useState<PostThemeReport>({});
    const [description, setDescription] = useState<string>(selectedReport?.comment ?? "");
    const [filesUploaded, setFilesUploaded] = useState<File[]>([]);

    const [expendedDescription, setExpendedDescription] = useState<boolean>(false);
    const [expendedDocument, setExpendedDocument] = useState<boolean>(false);

    const [errorTheme, setErrorTheme] = useState<string>("");
    const [errorFiles, setErrorFiles] = useState<ErrorFile[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const { community } = useCommunityStore();

    useEffect(() => {
        if (selectedReport) {
            setSelectedTheme(selectedReport?.themes[0]);
            setThemeAttributes(getThemeAttributes(selectedReport?.themes[0]));
        }
    }, [selectedReport]);

    if (!community) return;

    const validateTheme = async () => {
        if (!selectedTheme) {
            setErrorTheme("Vous devez obligatoirement choisir un thème et ses attributs pour envoyer un signalement");
            return;
        } else {
            setErrorTheme("");
        }
    };

    const validateFiles = (files: File[]) => {
        if (files.length) {
            files.forEach((file: File) => {
                if (!allowedTypes.includes(file.type)) {
                    setErrorFiles((errorFiles) => [...errorFiles, { file, message: `Formats supportés : JPG, PNG, PDF` }]);
                    return;
                }

                if (file.size > maxSizeBytes) {
                    setErrorFiles((errorFiles) => [...errorFiles, { file, message: `Taille maximale : ${maxSizeMB} Mo.` }]);
                    return;
                }
            });
        } else {
            setErrorFiles([]);
        }
    };

    const onSubmit = async () => {
        if (!community) return;
        await validateTheme();
        await validateFiles(filesUploaded);
        if (!selectedTheme || errorTheme || errorFiles.length) {
            return;
        }
        try {
            setLoading(true);
            await handleSubmit(selectedTheme, themeAttributes, description, filesUploaded);
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
        setErrorTheme("");
        setErrorFiles([]);
        setLoading(false);
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
        setThemeAttributes(attributes);
    };

    return (
        <div className="report-drawer">
            {loading && <LoaderComponent />}
            <h1 className="fr-mt-4v fr-mb-1v fr-text--md">
                {selectedReport ? `Modification du signalement ${selectedReport.id}` : "Soumettre un signalement"}
            </h1>
            {!selectedReport && (
                <p className="fr-text--sm fr-mb-1v ">
                    Si vous ne l’avez pas encore fait, localisez sur la carte l’endroit où effectuer un signalement, ou dessinez un croquis explicatif à cet
                    endroit.
                </p>
            )}
            <p className="fr-text--xs ">Seule la rubrique “Choisir un thème” est obligatoire.</p>
            <RadioButtons
                legend="Choisir un thème *:"
                options={community.themes.map((theme) => {
                    return {
                        label: theme.theme,
                        nativeInputProps: {
                            checked: selectedTheme?.theme === theme.theme,
                            onClick: () => {
                                setSelectedTheme(theme);
                                setThemeAttributes(getThemeAttributes(theme));

                                setErrorTheme("");
                            },
                            required: true,
                        },
                    };
                })}
                state={selectedTheme ? "success" : errorTheme ? "error" : "default"}
                stateRelatedMessage={errorTheme ?? ""}
                orientation="horizontal"
                small
                className="theme-radio fr-mt-4v fr-mb-1v fr-text--md"
            />

            {selectedTheme && <ThemeForm theme={selectedTheme} themeAttributes={themeAttributes} onChangeThemeAttributes={onChangeThemeAttributes} />}

            <Accordion
                label="Décrire le signalement"
                onExpandedChange={() => {
                    if (selectedTheme) {
                        setExpendedDescription(!expendedDescription);
                    } else {
                        validateTheme();
                        setExpendedDescription(false);
                    }
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
                    if (selectedTheme) {
                        setExpendedDocument(!expendedDocument);
                    } else {
                        validateTheme();
                        setExpendedDocument(false);
                    }
                }}
                expanded={expendedDocument}
            >
                <div
                    style={{
                        width: "100%",
                    }}
                >
                    <Upload
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
                    <ReportAttachments selectedReport={selectedReport} newFiles={filesUploaded} errorFiles={errorFiles} removeFile={removeFile} />
                </div>
            </Accordion>
            <div className="note">
                <p>Pour soumettre un signalement hors guichet, accédez au portail cartographique de l’IGN :</p>
                <a href="http://" target="_blank" rel="noopener noreferrer">
                    Signalement hors guichet
                </a>
            </div>

            {!selectedReport ? (
                <Button size="large" onClick={onSubmit} className="submit">
                    Envoyer le signalement
                </Button>
            ) : (
                <div className="buttons">
                    <Button priority="secondary" onClick={onDelete}>
                        Supprimer
                    </Button>
                    <Button priority="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={onSubmit}>Modifier</Button>
                </div>
            )}
        </div>
    );
};

export default ReportForm;
