export interface CommunityDocument {
    id: number;
    short_fileName: string;
    description?: string | null;
    title?: string | null;
    mime_type: string;
    size: number;
    width?: number | null;
    height?: number | null;
    filename: string | null;
    geometry: string | null;
    uri: string;
    download_uri?: string;
}

export interface DisplayDocument {
    id?: number;
    name: string;
    mimeType: string;
    uri: string;
}

export interface DocumentModalContext {
    document: DisplayDocument | null;
    localFile?: File;
    pendingMessage?: string;
    stageOnSelect?: boolean;
    canEdit: boolean;
    onSave?: (file: File) => Promise<DisplayDocument | void>;
    onDelete?: () => Promise<void>;
}
