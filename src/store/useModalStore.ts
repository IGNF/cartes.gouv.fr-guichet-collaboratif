import { createModal } from "@codegouvfr/react-dsfr/Modal";

import { create } from "zustand";
interface ModalState {
    replyReportModal: ReturnType<typeof createModal>;
}
const confirmModal = createModal({ id: "answerreport-modal", isOpenedByDefault: false });

export const useModalStore = create<ModalState>(() => ({
    replyReportModal: confirmModal,
}));
