import { REPORTS_API_URL } from "@/constants/urls";
import { axiosApi } from ".";
import { CommunityReport, attachmentData } from "@/constants/reports/types";

export async function postCommunityReportAttachments(report: CommunityReport, files: File[]): Promise<attachmentData[] | null> {
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append(`document${index}`, file);
    });
    const res = await axiosApi.post(`${REPORTS_API_URL}/${report.id}/attachments`, formData);
    if (!res.data || res.status !== 200) return null;

    const newAttachments: attachmentData[] = res.data;
    if (!Array.isArray(newAttachments)) return null;
    return newAttachments.map((attachment) => ({
        id: attachment.id,
        short_fileName: attachment.short_fileName,
        mime_type: attachment.mime_type,
        size: attachment.size,
        uri: attachment.uri,
    }));
}

function deleteAttachment(reportsId: number, attachmentId: number) {
    return axiosApi.delete(`${REPORTS_API_URL}/${reportsId}/attachments/${attachmentId}`);
}

export async function deleteCommunityReportAttachment(reportsId: number, attachmentId: number): Promise<boolean> {
    const res = await deleteAttachment(reportsId, attachmentId);

    if (res.status !== 204) return false;

    return true;
}

export async function deleteCommunityReportAllAttachments(report: CommunityReport): Promise<boolean> {
    if (!report.attachments.length) return true;
    const res = await Promise.all(report.attachments.map((attachment) => deleteAttachment(report.id, attachment.id)));

    if (!res) return false;

    return true;
}
