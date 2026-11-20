import { create } from "zustand";

import { DocumentModalContext } from "@/constants/documents/types";

interface DocumentModalStore {
    context: DocumentModalContext | null;
    setContext: (context: DocumentModalContext | null) => void;
}

export const useDocumentModalStore = create<DocumentModalStore>((set) => ({
    context: null,
    setContext: (context) => set({ context }),
}));
