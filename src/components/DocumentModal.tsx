import { useEffect, useState } from "react";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

import { useTranslation } from "@/i18n";
import { useDocumentModalStore, useModalStore } from "@/store";
import { downloadDocument } from "@/api/documentData";
import ModaleComponent from "./ModaleComponent";

export default function DocumentModal() {
    const { documentModal } = useModalStore();
    const { context, setContext } = useDocumentModalStore();
    const { t } = useTranslation({ DocumentModal });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState("");
    const [localPreviewUrl, setLocalPreviewUrl] = useState("");

    useEffect(() => {
        return () => {
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
    }, [localPreviewUrl]);

    const setPreviewFile = (file: File | null) => {
        setSelectedFile(file);
        setLocalPreviewUrl(file ? URL.createObjectURL(file) : "");
    };

    useIsModalOpen(documentModal, {
        onDisclose: () => {
            setPreviewFile(useDocumentModalStore.getState().context?.localFile ?? null);
            setError("");
            setIsDownloading(false);
        },
        onConceal: () => {
            setPreviewFile(null);
            setError("");
            setContext(null);
        },
    });

    const handleSave = async () => {
        if (!selectedFile || !context?.onSave) return;

        setIsSaving(true);
        setError("");
        try {
            const document = await context.onSave(selectedFile);
            if (document) setContext({ ...context, document });
            setPreviewFile(null);
            documentModal.close();
        } catch {
            setError(t("operation_error"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (file: File | null) => {
        setPreviewFile(file);
        setError("");
        if (!file || !context?.stageOnSelect || !context.onSave) return;

        try {
            const document = await context.onSave(file);
            setContext({ ...context, ...(document ? { document } : {}), localFile: file });
        } catch {
            setError(t("operation_error"));
        }
    };

    const handleDelete = async () => {
        if (!context?.onDelete) return;

        setIsDeleting(true);
        setError("");
        try {
            await context.onDelete();
            setContext({ ...context, document: null });
            setPreviewFile(null);
            documentModal.close();
        } catch {
            setError(t("operation_error"));
        } finally {
            setIsDeleting(false);
        }
    };

    const document =
        selectedFile && localPreviewUrl
            ? {
                  name: selectedFile.name,
                  mimeType: selectedFile.type,
                  uri: localPreviewUrl,
              }
            : context?.document;
    const isImage = document?.mimeType.startsWith("image/");
    const isPdf = document?.mimeType === "application/pdf";
    const isBusy = isSaving || isDeleting || isDownloading;

    const handleDownload = async () => {
        if (!document) return;

        setIsDownloading(true);
        setError("");
        try {
            if (selectedFile) {
                const objectUrl = URL.createObjectURL(selectedFile);
                const link = globalThis.document.createElement("a");
                link.href = objectUrl;
                link.download = selectedFile.name;
                globalThis.document.body.appendChild(link);
                link.click();
                link.remove();
                globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
            } else {
                await downloadDocument(document.uri, document.name);
            }
        } catch {
            setError(t("download_error"));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <ModaleComponent modal={documentModal} title={document?.name || t("title")} size="large" className="document-modal">
            <div className="document-modal__content">
                {document ? (
                    <>
                        <div className="document-modal__preview">
                            {isImage ? (
                                <img src={document.uri} alt={document.name} />
                            ) : isPdf ? (
                                <iframe src={document.uri} title={document.name} />
                            ) : (
                                <p>{document.name}</p>
                            )}
                        </div>
                        <div className="document-modal__document-actions">
                            <a className="fr-link fr-icon-external-link-line fr-link--icon-right" href={document.uri} target="_blank" rel="noreferrer">
                                {t("open_document")}
                            </a>
                            <Button iconId="fr-icon-download-line" priority="secondary" disabled={isBusy} onClick={handleDownload}>
                                {isDownloading ? t("downloading") : t("download_document")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <p>{t("no_document")}</p>
                )}

                {context?.canEdit && context.onSave && (
                    <Upload
                        label={document ? t("replace_document") : t("add_document")}
                        className="fr-mt-4w"
                        nativeInputProps={{
                            onChange: (event) => void handleFileChange(event.target.files?.[0] ?? null),
                        }}
                    />
                )}

                {selectedFile && context?.pendingMessage && <Alert severity="warning" small description={context.pendingMessage} />}
                {error && <p className="fr-error-text">{error}</p>}
                {isSaving && <p className="fr-info-text">{t("saving")}</p>}
                {isDeleting && <p className="fr-info-text">{t("deleting")}</p>}

                {context?.canEdit && (
                    <div className="document-modal__actions">
                        {context.onDelete && document && (
                            <Button priority="secondary" iconId="ri-delete-bin-line" disabled={isBusy} onClick={handleDelete}>
                                {t("delete")}
                            </Button>
                        )}
                        {context.onSave && !context.stageOnSelect && (
                            <Button disabled={!selectedFile || isBusy} onClick={handleSave}>
                                {t("save")}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </ModaleComponent>
    );
}
