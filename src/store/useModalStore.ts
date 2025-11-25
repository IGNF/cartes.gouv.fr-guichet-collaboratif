import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { create } from "zustand";

interface ModalState {
    replyReportModal: ReturnType<typeof createModal>;
    deleteReportModal: ReturnType<typeof createModal>;
    deleteShareReportModal: ReturnType<typeof createModal>;
    confirmCancelModal: ReturnType<typeof createModal>;
    confirmResetContributionModal: ReturnType<typeof createModal>;
}

const modalConfigs = [
    { key: "replyReportModal", id: "answerreport-modal" },
    { key: "deleteReportModal", id: "deletereport-modal" },
    { key: "deleteShareReportModal", id: "deletesharereport-modal" },
    { key: "confirmCancelModal", id: "cancelreport-modal" },
    { key: "confirmResetContributionModal", id: "confirm-reset-contribution-modal" },
];

const modals = modalConfigs.reduce((acc, { key, id }) => {
    acc[key as keyof ModalState] = createModal({ id, isOpenedByDefault: false });
    return acc;
}, {} as ModalState);

export const useModalStore = create<ModalState>(() => modals);
