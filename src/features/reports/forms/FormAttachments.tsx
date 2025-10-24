import { ChangeEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { postCommunityReportAttachments } from "@/api/attachmentData";
import { useCommunityStore, useReportStore } from "@/store";
import { ErrorFile } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import Button from "@codegouvfr/react-dsfr/Button";
import AttachmentList from "./AttachmentList";

const allowedTypes = ["image/png", "image/jpg", "application/pdf"];
const maxSizeMB = 3;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

const FormAttachments = () => {
    const { t } = useTranslation({ FormAttachments });

    const [filesUploaded, setFilesUploaded] = useState<File[]>([]);

    const [errorFiles, setErrorFiles] = useState<ErrorFile[]>([]);

    const filesRef = useRef<HTMLDivElement>(null);

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
    const { community, addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports } = useReportStore();

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

    if (!community || !selectedReport) return null;

    const handleUpdateReport = async (filesUploaded: File[]) => {
        try {
            if (!selectedReport) return;
            if (filesUploaded.length) {
                const attachmentsUploaded = await postCommunityReportAttachments({ ...selectedReport, id: selectedReport.id }, filesUploaded);

                if (!attachmentsUploaded || !attachmentsUploaded.length) {
                    addAlertMessage(StatusMessage.error, "report_document_uploaded_error");
                } else {
                    selectedReport.attachments = attachmentsUploaded;
                    addAlertMessage(StatusMessage.success, t("report_document_uploaded_success"));
                }
            }
            addAlertMessage(StatusMessage.success, t("report_updated_success", { reportId: selectedReport.id }));

            setReports([...reports.filter((report) => report.id !== selectedReport.id), selectedReport], true);
        } catch {
            addAlertMessage(StatusMessage.error, t("report_updated_error"));
            throw new Error();
        }
    };
    return (
        <div className="report-form-attachments">
            <AttachmentList newFiles={filesUploaded} errorFiles={errorFiles} removeFile={removeFile} />
            <Upload
                ref={filesRef}
                label={t("import_attachments_label")}
                hint={t("import_attachments_hint", { maxSizeMB })}
                state={errorFiles.length ? "error" : filesUploaded.length ? "success" : "default"}
                stateRelatedMessage=""
                multiple
                className="upload-file  fr-mb-7v"
                nativeInputProps={{
                    value: "",
                    accept: ".jpg,.png,.pdf",
                    onChange: (e) => onUploadChange(e),
                }}
            />

            <Button onClick={() => handleUpdateReport(filesUploaded)} disabled={filesUploaded.length === 0}>
                Ajouter
            </Button>
        </div>
    );
};

export default FormAttachments;
