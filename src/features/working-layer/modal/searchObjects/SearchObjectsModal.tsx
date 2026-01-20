import ModaleComponent from "@/components/ModaleComponent";
import { useCommunityStore, useContributionStore, useLocalStorageStore, useMapStore, useModalStore } from "@/store";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useCallback, useMemo, useState } from "react";
import SearchObjectsFilters from "./SearchObjectsFilters";
import ConstraintsComponent from "./ConstraintsComponent";
import { Group } from "@/constants/contributions/types";
import { createGroup, getRules } from "@/constants/contributions/utils";
import { toMongoFilter } from "@/constants/working-layer/utils";
import useExtentList from "@/hooks/working-layer/searchObjects/useExtentList";
import { StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import LoaderComponent from "@/components/LoaderComponent";
import SearchTable from "./SearchTable";
import ConfirmDeleteObjectModal from "./ConfirmDeleteObjectModal";
import { searchFilteredObjects } from "@/api/featureTypesData";
import { LocalStorageData } from "@/constants/localStorage/types";

const SearchObjectsModal = () => {
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const [root, setRoot] = useState<Group>(localStorageData?.searchRoot ? localStorageData?.searchRoot : () => createGroup());
    const [maxNumber, setMaxNumber] = useState(localStorageData?.searchMax ?? 20);

    const { setSearchResult } = useContributionStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const extentList = useExtentList();
    const [selectedExtent, setSelectedExtent] = useState<string>(localStorageData?.searchExtent ?? extentList[0].value);

    const { community, communityLayers, addAlertMessage } = useCommunityStore();
    const { map, mapWorkingLayer, setClickedControl } = useMapStore();
    const { searchModal } = useModalStore();

    const geoservice = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer)?.geoservice, [communityLayers, mapWorkingLayer]);
    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice?.columns?.find((c) => c.name === geoservice?.geometryName)?.crs ?? "EPSG:3857", [geoservice]);

    const filterDetruit = useMemo(() => (geoservice?.columns?.find((c) => c.name === "detruit") ? { detruit: false } : {}), [geoservice]);
    const filterFictif = useMemo(() => (geoservice?.columns?.find((c) => c.name === "fictif") ? { fictif: false } : {}), [geoservice]);

    const onClose = useCallback(() => {
        setClickedControl(null);
    }, [setClickedControl]);

    useIsModalOpen(searchModal, {
        onConceal: onClose,
    });

    const onConfirm = useCallback(async () => {
        try {
            if (!community) return;
            searchModal.open();
            if (!root.rules.length) {
                addAlertMessage(StatusMessage.warning, "Veuillez ajouter une condition", 3000);
                return;
            }
            if (!geoservice || !map) return;
            const params = getRules(root);
            const urlParams = toMongoFilter(params);

            const filterParam = `&filter=${JSON.stringify({ ...urlParams.filter, ...filterDetruit, ...filterFictif })}`;
            let newExtent = map.getView().calculateExtent(map.getSize());
            if (selectedExtent === "table_extent") newExtent = [Infinity];
            if (selectedExtent.split(",").length > 1) {
                newExtent = selectedExtent.split(",").map((e) => Number(e));
            }

            setIsLoading(true);
            const result = await searchFilteredObjects(queryClient, geoservice, maxNumber, newExtent, mapProjCode, geoProjCode, filterParam);

            setSearchResult(result);
            setIsLoading(false);
            const newLocalStoageData: LocalStorageData = {
                ...localStorageData,
                searchRoot: root,
                searchMax: maxNumber,
                searchExtent: selectedExtent,
                activeLayer: localStorageData?.activeLayer ?? "",
                center: localStorageData?.center ?? [],
                layers: localStorageData?.layers ?? [],
                zoom: localStorageData?.zoom ?? 1,
                projection: localStorageData?.projection ?? "",
            };
            setLocalStorage(community?.name, newLocalStoageData);
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            addAlertMessage(StatusMessage.error, errorMessage);
            setIsLoading(false);
            setSearchResult([]);
        }
    }, [
        root,
        geoservice,
        maxNumber,
        selectedExtent,
        map,
        geoProjCode,
        mapProjCode,
        queryClient,
        searchModal,
        community,
        localStorageData,
        filterDetruit,
        filterFictif,
        setLocalStorage,
        addAlertMessage,
        setSearchResult,
    ]);

    return (
        <>
            <ModaleComponent
                className="search-modal"
                modal={searchModal}
                title="Rechercher"
                onClose={onClose}
                onConfirm={onConfirm}
                confirmText="Rechercher"
                size="large"
            >
                <>
                    <div className="search-property">
                        <SearchObjectsFilters root={root} setRoot={setRoot} />
                        <ConstraintsComponent
                            extentList={extentList}
                            maxNumber={maxNumber}
                            setMaxNumber={setMaxNumber}
                            selectedExtent={selectedExtent}
                            setSelectedExtent={setSelectedExtent}
                        />
                        {isLoading ? <LoaderComponent /> : <SearchTable geoservice={geoservice!} />}
                    </div>
                </>
            </ModaleComponent>
            <ConfirmDeleteObjectModal />
        </>
    );
};

export default SearchObjectsModal;
