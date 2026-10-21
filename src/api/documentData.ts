import { COMMUNITIES_API_URL } from "@/constants/urls";
import { CommunityDocument, DisplayDocument } from "@/constants/documents/types";
import { getAxiosApi } from ".";

const toDisplayDocument = (document: CommunityDocument): DisplayDocument => ({
    id: document.id,
    name: document.short_fileName || document.title || String(document.id),
    mimeType: document.mime_type,
    uri: document.download_uri || document.uri,
});

export async function getCommunityDocument(communityId: number, documentId: number): Promise<CommunityDocument> {
    const api = await getAxiosApi();
    const response = await api.get<CommunityDocument>(`${COMMUNITIES_API_URL}/${communityId}/documents/${documentId}`);
    return response.data;
}

export async function createCommunityDocument(communityId: number, file: File): Promise<CommunityDocument> {
    const api = await getAxiosApi();
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("document", file);

    const response = await api.post<CommunityDocument>(`${COMMUNITIES_API_URL}/${communityId}/documents`, formData);
    return response.data;
}

export async function deleteCommunityDocument(communityId: number, documentId: number): Promise<void> {
    const api = await getAxiosApi();
    await api.delete(`${COMMUNITIES_API_URL}/${communityId}/documents/${documentId}`);
}

export async function downloadDocument(uri: string, fileName: string): Promise<void> {
    const api = await getAxiosApi();
    const response = await api.get<Blob>(uri, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data);
    const link = globalThis.document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    globalThis.document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export { toDisplayDocument };
