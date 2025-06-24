import { ErrorFile, ReportAttachment } from "@/constants/reports/types";
import fileUploadIcon from "../../../icons/file-upload-icon.jpg";
import Button from "@codegouvfr/react-dsfr/Button";
import { deleteCommunityReportAttachment } from "@/api/attachmentData";
import { useCommunityStore, useReportStore } from "@/store";
import { StatusMessage } from "@/constants/communities/types";
import { Fragment, useMemo, useState } from "react";
import LoaderComponent from "@/components/LoaderComponent";

interface Props {
    newFiles?: File[] | null;
    errorFiles?: ErrorFile[];
    removeFile?: (file: File) => void;
}

const AttachmentList: React.FC<Props> = ({ newFiles, errorFiles, removeFile }) => {
    const { addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports, isShowReport } = useReportStore();

    const [loading, setLoading] = useState(false);

    const report = useMemo(() => reports.find((r) => r.id === selectedReport?.id), [reports, selectedReport]);

    if (!report && !newFiles) return null;
    const deleteAttachment = async (attachment: ReportAttachment) => {
        if (!report) return;
        setLoading(true);
        const attachmentDeleted = await deleteCommunityReportAttachment(report?.id, attachment.id);
        if (!attachmentDeleted) {
            addAlertMessage(StatusMessage.error, `Erreur dans la suppression du document ${attachment.name}`);
            setLoading(false);
            return;
        }
        report.attachments = report.attachments.filter((doc) => doc.id !== attachment.id);
        addAlertMessage(StatusMessage.success, `Suppression du document ${attachment.name} avec succès`);
        setReports([...reports.filter((r) => r.id !== report.id), report], true);
        setLoading(false);
    };

    return (
        <div className="report-attachments">
            {loading && <LoaderComponent />}
            {isShowReport() && !report?.attachments.length && <p>Aucun document associé</p>}
            {report &&
                report.attachments.map((attachment) => (
                    <div key={`attachment_${attachment.id}`}>
                        <img src={fileUploadIcon} alt="Icone du fichier chargé" />
                        <a href={attachment.url} target="_blank">
                            {attachment.name}
                        </a>
                        {!isShowReport() && (
                            <Button
                                iconId="ri-delete-bin-2-fill"
                                title={`Supprimer ${attachment.name}`}
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
                                <img src={fileUploadIcon} alt="Icone du fichier chargé" />
                                <a href={URL.createObjectURL(file)} target="_blank">
                                    {file.name}
                                </a>
                                {removeFile && (
                                    <Button
                                        iconId="ri-delete-bin-2-fill"
                                        title={`Supprimer ${file.name}`}
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
