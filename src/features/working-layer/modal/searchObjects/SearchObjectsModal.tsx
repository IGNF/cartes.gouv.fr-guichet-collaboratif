import ModaleComponent from "@/components/ModaleComponent";
import { useMapStore, useModalStore } from "@/store";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useCallback } from "react";
import SearchObjectsFilters from "./SearchObjectsFilters";
import ConstraintsComponent from "./ConstraintsComponent";

const SearchObjectsModal = () => {
    const { setClickedControl } = useMapStore();
    const { searchModal } = useModalStore();

    const onClose = useCallback(() => {
        setClickedControl(null);
    }, [setClickedControl]);

    useIsModalOpen(searchModal, {
        onConceal: onClose,
    });

    const onConfirm = useCallback(() => {}, []);

    return (
        <ModaleComponent
            className="search-modal"
            modal={searchModal}
            title="Rechercher"
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText="Rechercher"
            size="large"
        >
            <div className="search-property">
                <SearchObjectsFilters />
                <ConstraintsComponent />
            </div>
        </ModaleComponent>
    );
};

export default SearchObjectsModal;
