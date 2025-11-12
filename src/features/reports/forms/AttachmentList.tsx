import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "@/i18n";
import { deleteCommunityReportAttachment } from "@/api/attachmentData";
import { useCommunityStore, useReportStore } from "@/store";
import { ErrorFile, ReportAttachment } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import Button from "@codegouvfr/react-dsfr/Button";
import LoaderComponent from "@/components/LoaderComponent";
import fileUploadIcon from "../../../icons/file-upload-icon.jpg";

interface Props {
    newFiles?: File[] | null;
    errorFiles?: ErrorFile[];
    removeFile?: (file: File) => void;
}

const AttachmentList: React.FC<Props> = ({ newFiles, errorFiles, removeFile }) => {
    const { addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports, isShowReport, editReport } = useReportStore();

    const [loading, setLoading] = useState(false);

    const report = useMemo(() => reports.find((r) => r.id === selectedReport?.id), [reports, selectedReport]);

    const { t } = useTranslation({ AttachmentList });

    if (!report && !newFiles) return null;
    const deleteAttachment = async (attachment: ReportAttachment) => {
        if (!report) return;
        setLoading(true);
        const attachmentDeleted = await deleteCommunityReportAttachment(report?.id, attachment.id);
        if (!attachmentDeleted) {
            addAlertMessage(StatusMessage.error, t("attchment_deleted_error", { fileName: attachment.name }));
            setLoading(false);
            return;
        }
        report.attachments = report.attachments.filter((doc) => doc.id !== attachment.id);
        addAlertMessage(StatusMessage.success, t("attchment_deleted_success", { fileName: attachment.name }));
        setReports([...reports.filter((r) => r.id !== report.id), report], true);
        setLoading(false);
    };

    return (
        <div className="report-attachments">
            {loading && <LoaderComponent />}
            {isShowReport() && !report?.attachments.length && <p>{t("no_attachments")}</p>}
            {report &&
                report.attachments.map((attachment) => (
                    <div key={`attachment_${attachment.id}`}>
                        <img src={fileUploadIcon} alt={t("alt_img_uploaded_file")} />
                        <a href={attachment.url} target="_blank">
                            {attachment.name}
                        </a>

                        {editReport && (
                            <Button
                                iconId="ri-delete-bin-2-fill"
                                title={t("delete_file", { fileName: attachment.name })}
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
