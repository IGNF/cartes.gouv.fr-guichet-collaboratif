import ModaleComponent from "@/components/ModaleComponent";
import { ContributionType } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import { useCallback } from "react";

const ConfirmDeleteObjectModal = () => {
    const { map, mapWorkingLayer } = useMapStore();
    const { confirmDeleteObjectSearchModal, searchModal } = useModalStore();
    const { searchItemToDelete, setSearchItemToDelete, saveContribution } = useContributionStore();

    const { t } = useTranslation({ ConfirmDeleteObjectModal });

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    useIsModalOpen(confirmDeleteObjectSearchModal, {
        onConceal: () => searchModal.open(),
        onDisclose: () => searchModal.open(),
    });

    const handleConfirmModal = useCallback(() => {
        if (!searchItemToDelete) return;
        clickableSource.removeFeature(searchItemToDelete);
        saveContribution(searchItemToDelete, ContributionType.DELETE, searchItemToDelete, mapWorkingLayer);
    }, [mapWorkingLayer, searchItemToDelete, clickableSource, saveContribution]);

    return (
        <ModaleComponent
            modal={confirmDeleteObjectSearchModal}
            title={t("title")}
            onClose={() => setSearchItemToDelete(null)}
            onConfirm={handleConfirmModal}
            cancelText={t("no")}
            confirmText={t("yes")}
        >
            <p>{t("description")}</p>
        </ModaleComponent>
    );
};

export default ConfirmDeleteObjectModal;
