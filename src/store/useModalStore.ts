import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { create } from "zustand";

interface ModalState {
    replyReportModal: ReturnType<typeof createModal>;
    deleteReportModal: ReturnType<typeof createModal>;
    deleteShareReportModal: ReturnType<typeof createModal>;
    confirmCancelModal: ReturnType<typeof createModal>;
    confirmResetContributionModal: ReturnType<typeof createModal>;
    confirmSaveContributionModal: ReturnType<typeof createModal>;
    confirmCopyModal: ReturnType<typeof createModal>;
    shareReport: ReturnType<typeof createModal>;
    confirmMultipleDeselectionModal: ReturnType<typeof createModal>;
    confirmMultipleObjectsActionModal: ReturnType<typeof createModal>;
    shareReportFilters: ReturnType<typeof createModal>;
}

const modalConfigs = [
    { key: "replyReportModal", id: "answerreport-modal" },
    { key: "deleteReportModal", id: "deletereport-modal" },
    { key: "deleteShareReportModal", id: "deletesharereport-modal" },
    { key: "confirmCancelModal", id: "cancelreport-modal" },
    { key: "confirmResetContributionModal", id: "confirm-reset-contribution-modal" },
    { key: "confirmSaveContributionModal", id: "confirm-save-contribution-modal" },
    { key: "confirmCopyModal", id: "confirm-copy-modal" },
    { key: "shareReport", id: "share-report-modal" },
    { key: "confirmMultipleDeselectionModal", id: "confirm-multiplr-deselection-modal" },
    { key: "confirmMultipleDeselectionModal", id: "confirm-multiple-deselection-modal" },
    { key: "confirmMultipleObjectsActionModal", id: "confirm-multiple-objects-action-modal" },
    { key: "shareReportFilters", id: "share-report-filters-modal" },
];

const modals = modalConfigs.reduce((acc, { key, id }) => {
    acc[key as keyof ModalState] = createModal({ id, isOpenedByDefault: false });
    return acc;
}, {} as ModalState);

export const useModalStore = create<ModalState>(() => modals);
