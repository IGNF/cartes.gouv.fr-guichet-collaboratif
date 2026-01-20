import ModaleComponent from "@/components/ModaleComponent";
import { ContributionType } from "@/constants/contributions/types";
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
            title={"Attention"}
            onClose={() => setSearchItemToDelete(null)}
            onConfirm={handleConfirmModal}
            cancelText={"Non"}
            confirmText={"Yes"}
        >
            <p>Êtes vous sûr de vouloir supprimer cet objet ?</p>
        </ModaleComponent>
    );
};

export default ConfirmDeleteObjectModal;
