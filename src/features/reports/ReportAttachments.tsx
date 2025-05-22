import { CommunityReport, ErrorFile, ReportAttachment } from "@/constants/reports/types";
import fileUploadIcon from "../../icons/file-upload-icon.jpg";
import Button from "@codegouvfr/react-dsfr/Button";
import { deleteCommunityReportAttachment } from "@/api/attachmentData";
import { useCommunityStore, useMapStore } from "@/store";
import { StatusMessage } from "@/constants/communities/types";
import { Fragment, useMemo, useState } from "react";
import { refreshReportLayer } from "@/constants/utils";
import LoaderComponent from "@/components/LoaderComponent";

interface Props {
    selectedReport: CommunityReport | undefined;
    newFiles: File[] | null;
    errorFiles: ErrorFile[];
    removeFile: (file: File) => void;
}

const ReportAttachments: React.FC<Props> = ({ selectedReport, newFiles, errorFiles, removeFile }) => {
    const { reports, addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

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
        addAlertMessage(StatusMessage.success, `Suppression du document ${attachment.name} avec succès`);
        refreshReportLayer(map);
        setLoading(false);
    };
    return (
        <div className="report-attachments">
            {loading && <LoaderComponent />}
            {report &&
                report.attachments.map((attachment) => (
                    <div key={`attachment_${attachment.id}`}>
                        <img src={fileUploadIcon} alt="Icone du fichier chargé" />
                        <a href={attachment.url} target="_blank">
                            {attachment.name}
                        </a>
                        <Button
                            iconId="ri-delete-bin-2-fill"
                            title={`Supprimer ${attachment.name}`}
                            priority="tertiary"
                            onClick={() => deleteAttachment(attachment)}
                        ></Button>
                    </div>
                ))}
            {newFiles &&
                newFiles.map((file, index) => {
                    const errorFile = errorFiles.find((error) => error.file === file);
                    return (
                        <Fragment key={`file_${index}`}>
                            <div>
                                <img src={fileUploadIcon} alt="Icone du fichier chargé" />
                                <a href={URL.createObjectURL(file)} target="_blank">
                                    {file.name}
                                </a>
                                <Button iconId="ri-delete-bin-2-fill" title={`Supprimer ${file.name}`} priority="tertiary" onClick={() => removeFile(file)} />
                            </div>
                            {errorFile && <p className="fr-error-text">{errorFile.message}</p>}
                        </Fragment>
                    );
                })}
        </div>
    );
};

export default ReportAttachments;
