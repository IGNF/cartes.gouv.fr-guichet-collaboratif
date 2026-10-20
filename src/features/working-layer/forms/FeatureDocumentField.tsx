import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";

import { getCommunityDocument, toDisplayDocument } from "@/api/documentData";
import { DisplayDocument } from "@/constants/documents/types";
import { StatusMessage } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useDocumentModalStore, useModalStore } from "@/store";

interface FeatureDocumentFieldProps {
    value: unknown;
    label: string;
    editable?: boolean;
    onChange?: (value: number | File[] | null) => void;
}

const getDocumentValue = (value: unknown): unknown => {
    if (typeof value !== "string") return value;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const getDocumentId = (value: unknown): number | null => {
    const parsedValue = getDocumentValue(value);
    if (typeof parsedValue === "number" && Number.isFinite(parsedValue)) return parsedValue;
    if (typeof parsedValue === "string" && /^\d+$/.test(parsedValue)) return Number(parsedValue);
    if (typeof parsedValue === "object" && parsedValue !== null && "id" in parsedValue) {
        const id = Number(parsedValue.id);
        return Number.isFinite(id) ? id : null;
    }
    return null;
};

const getLocalFile = (value: unknown): File | null => {
    if (value instanceof File) return value;
    if (Array.isArray(value) && value[0] instanceof File) return value[0];
    return null;
};

const getDisplayDocument = (value: unknown, fallbackName: string): DisplayDocument | null => {
    const parsedValue = getDocumentValue(value);
    if (typeof parsedValue === "string" && /^https?:\/\//.test(parsedValue)) {
        return {
            name: fallbackName,
            mimeType: "",
            uri: parsedValue,
        };
    }
    if (typeof parsedValue !== "object" || parsedValue === null) return null;

    const uri =
        ("download_uri" in parsedValue && typeof parsedValue.download_uri === "string" && parsedValue.download_uri) ||
        ("uri" in parsedValue && typeof parsedValue.uri === "string" && parsedValue.uri);
    if (!uri) return null;

    const id = getDocumentId(parsedValue) ?? undefined;
    const name =
        ("short_fileName" in parsedValue && typeof parsedValue.short_fileName === "string" && parsedValue.short_fileName) ||
        ("title" in parsedValue && typeof parsedValue.title === "string" && parsedValue.title) ||
        fallbackName;
    const mimeType = "mime_type" in parsedValue && typeof parsedValue.mime_type === "string" ? parsedValue.mime_type : "";

    return { id, name, mimeType, uri };
};

export default function FeatureDocumentField({ value, label, editable = false, onChange }: FeatureDocumentFieldProps) {
    const { community, addAlertMessage } = useCommunityStore();
    const { documentModal } = useModalStore();
    const { setContext } = useDocumentModalStore();
    const { t } = useTranslation({ FeatureDocumentField });
    const [isLoading, setIsLoading] = useState(false);

    const documentId = getDocumentId(value);
    const localFile = getLocalFile(value);
    const hasDocument = localFile !== null || documentId !== null || getDisplayDocument(value, label) !== null;

    if (!hasDocument && !editable) {
        return <span>{t("no_document")}</span>;
    }

    const openDocument = async () => {
        if (!community) return;

        setIsLoading(true);
        try {
            let document = getDisplayDocument(value, label);
            if (!document && documentId !== null) {
                document = toDisplayDocument(await getCommunityDocument(community.id, documentId));
            }

            setContext({
                document,
                localFile: localFile ?? undefined,
                pendingMessage: editable ? t("pending_document_warning") : undefined,
                stageOnSelect: editable,
                canEdit: editable,
                onSave:
                    editable && onChange
                        ? async (file) => {
                              onChange([file]);
                          }
                        : undefined,
                onDelete:
                    editable && onChange && hasDocument
                        ? async () => {
                              onChange(null);
                          }
                        : undefined,
            });
            documentModal.open();
        } catch {
            addAlertMessage(StatusMessage.error, t("document_load_error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button priority="secondary" iconId={hasDocument ? "fr-icon-eye-line" : "fr-icon-add-line"} disabled={isLoading} onClick={openDocument}>
            {hasDocument ? t("view_document") : t("add_document")}
        </Button>
    );
}
