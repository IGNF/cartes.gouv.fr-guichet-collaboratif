import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "@/i18n";
import { deleteCommunityReportAttachment } from "@/api/attachmentData";
import { useCommunityStore, useDocumentModalStore, useModalStore, useReportStore } from "@/store";
import { ErrorFile, attachmentData } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import Button from "@codegouvfr/react-dsfr/Button";
import LoaderComponent from "@/components/LoaderComponent";
import fileUploadIcon from "../../../icons/file-upload-icon.jpg";

interface Props {
    newFiles?: File[] | null;
    errorFiles?: ErrorFile[];
    removeFile?: (file: File) => void;
    showDocument?: boolean;
}

const AttachmentList: React.FC<Props> = ({ newFiles, errorFiles, removeFile, showDocument }) => {
    const { addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports, editReport } = useReportStore();
    const { documentModal } = useModalStore();
    const { setContext } = useDocumentModalStore();

    const [loading, setLoading] = useState(false);

    const report = useMemo(() => reports.find((r) => r.id === selectedReport?.id) ?? selectedReport, [reports, selectedReport]);

    const { t } = useTranslation({ AttachmentList });

    if (!report && !newFiles) return null;
    const viewAttachment = (attachment: attachmentData) => {
        setContext({
            canEdit: false,
            document: {
                id: attachment.id,
                name: attachment.short_fileName,
                mimeType: attachment.mime_type,
                uri: attachment.uri,
            },
        });
        documentModal.open();
    };

    const deleteAttachment = async (attachment: attachmentData) => {
        if (!report) return;
        setLoading(true);
        const attachmentDeleted = await deleteCommunityReportAttachment(report?.id, attachment.id);
        if (!attachmentDeleted) {
            addAlertMessage(StatusMessage.error, t("attchment_deleted_error", { fileName: attachment.short_fileName }));
            setLoading(false);
            return;
        }
        const updatedReports = reports.map((currentReport) =>
            currentReport.id === report.id
                ? {
                      ...currentReport,
                      attachments: currentReport.attachments.filter((doc) => doc.id !== attachment.id),
                  }
                : currentReport
        );
        setReports(updatedReports, true);
        setLoading(false);
    };
    return (
        <div className="report-attachments">
            {loading && <LoaderComponent />}
            {!((report?.attachments?.length ?? 0) > 0 || (newFiles?.length ?? 0) > 0) && <p>{t("no_attachments")}</p>}
            {report?.attachments?.map((attachment) => (
                <div key={`attachment_${attachment.id}`}>
                    <img src={fileUploadIcon} alt={t("alt_img_uploaded_file")} />
                    <a href={attachment.uri} target="_blank">
                        {attachment.short_fileName}
                    </a>
                    <Button
                        iconId="fr-icon-eye-line"
                        title={t("view_file", { fileName: attachment.short_fileName })}
                        priority="tertiary"
                        onClick={() => viewAttachment(attachment)}
                    >
                        {t("view")}
                    </Button>

                    {editReport && showDocument && (
                        <Button
                            iconId="ri-delete-bin-2-fill"
                            title={t("delete_file", { fileName: attachment.short_fileName })}
                            priority="tertiary"
                            onClick={() => deleteAttachment(attachment)}
                        ></Button>
                    )}
                </div>
            ))}
            {newFiles &&
                newFiles.map((file, index) => {
                    const errorFile = errorFiles?.find((error) => error.file === file);
                    return (
                        <Fragment key={`file_${index}`}>
                            <div>
                                <img src={fileUploadIcon} alt={t("alt_img_uploaded_file")} />
                                <a href={URL.createObjectURL(file)} target="_blank">
                                    {file.name}
                                </a>
                                {removeFile && (
                                    <Button
                                        iconId="ri-delete-bin-2-fill"
                                        title={t("delete_file", { fileName: file.name })}
                                        priority="tertiary"
                                        onClick={() => removeFile(file)}
                                    />
                                )}
                            </div>
                            {errorFile && <p className="fr-error-text">{errorFile.message}</p>}
                        </Fragment>
                    );
                })}
        </div>
    );
};

export default AttachmentList;
