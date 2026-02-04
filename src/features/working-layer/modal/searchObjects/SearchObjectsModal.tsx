import ModaleComponent from "@/components/ModaleComponent";
import { useCommunityStore, useContributionStore, useLocalStorageStore, useMapStore, useModalStore, useSavedSearchesStore } from "@/store";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SearchObjectsFilters from "./SearchObjectsFilters";
import ConstraintsComponent from "./ConstraintsComponent";
import { Group } from "@/constants/savedSearches/types";
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
import { useTranslation } from "@/i18n";
import SaveSearchForm from "./SaveSearchForm";
import SavedSearchesList from "./SavedSearchesList";
import { SavedSearch } from "@/constants/savedSearches/types";
import Button from "@codegouvfr/react-dsfr/Button";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

const SearchObjectsModal = () => {
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const { setSearchResult } = useContributionStore();
    const { loadLocalSavedSearches } = useSavedSearchesStore();

    const { t } = useTranslation({ SearchObjectsModal });

    const [root, setRoot] = useState<Group>(localStorageData?.searchRoot ? localStorageData?.searchRoot : () => createGroup());
    const [maxNumber, setMaxNumber] = useState(localStorageData?.searchMax ?? 20);
    const [showSavedSearches, setShowSavedSearches] = useState(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const previousLayerRef = useRef<string | null>(null);

    const queryClient = useQueryClient();

    const extentList = useExtentList();
    const [selectedExtent, setSelectedExtent] = useState<string>(localStorageData?.searchExtent ?? extentList[0].value);

    const { community, communityLayers, addAlertMessage } = useCommunityStore();
    const { map, mapWorkingLayer, setClickedControl } = useMapStore();
    const { searchModal } = useModalStore();

    const geoservice = useMemo(() => communityLayers?.find((l) => l?.geoservice?.layer === mapWorkingLayer)?.geoservice, [communityLayers, mapWorkingLayer]);
    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice?.columns?.find((c) => c.name === geoservice?.geometryName)?.crs ?? "EPSG:3857", [geoservice]);
    const queryableColumns = useMemo(() => geoservice?.columns?.filter((col) => col.queryable), [geoservice]);
    const hasQueryableColumns = Boolean(queryableColumns && queryableColumns.length > 0);

    const filterDetruit = useMemo(() => (geoservice?.columns?.find((c) => c.name === "detruit") ? { detruit: false } : {}), [geoservice]);
    const filterFictif = useMemo(() => (geoservice?.columns?.find((c) => c.name === "fictif") ? { fictif: false } : {}), [geoservice]);

    const onClose = useCallback(() => {
        setClickedControl(null);
    }, [setClickedControl]);

    const isModalOpen = useIsModalOpen(searchModal, {
        onConceal: onClose,
    });
    const hasTriggeredDefaultSearch = useRef(false);

    const buildFilterParam = useCallback(() => {
        const hasRules = root.rules.length > 0;
        const rulesFilter = hasRules ? toMongoFilter(getRules(root)).filter : {};
        const mergedFilter = { ...rulesFilter, ...filterDetruit, ...filterFictif };
        return Object.keys(mergedFilter).length ? `&filter=${JSON.stringify(mergedFilter)}` : "";
    }, [filterDetruit, filterFictif, root]);

    const performSearch = useCallback(async () => {
        if (!community) return false;
        if (!geoservice || !map) return false;
        if (mapWorkingLayer === REPORTS_LAYER_TYPE) return false;

        let newExtent = map.getView().calculateExtent(map.getSize());
        if (selectedExtent === "table_extent") newExtent = [Infinity];
        if (selectedExtent.split(",").length > 1) {
            newExtent = selectedExtent.split(",").map((e) => Number(e));
        }

        const filterParam = buildFilterParam();

        setIsLoading(true);
        try {
            const result = await searchFilteredObjects(queryClient, geoservice, maxNumber, newExtent, mapProjCode, geoProjCode, filterParam);
            setSearchResult(result);
            return true;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error";
            addAlertMessage(StatusMessage.error, errorMessage);
            setSearchResult([]);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [
        addAlertMessage,
        community,
        geoProjCode,
        geoservice,
        map,
        mapProjCode,
        maxNumber,
        queryClient,
        selectedExtent,
        setSearchResult,
        buildFilterParam,
        mapWorkingLayer,
        t,
    ]);

    useEffect(() => {
        if (!community?.name || !mapWorkingLayer) return;
        loadLocalSavedSearches(community.name, mapWorkingLayer);
    }, [community?.name, mapWorkingLayer, loadLocalSavedSearches]);

    useEffect(() => {
        if (previousLayerRef.current !== null && previousLayerRef.current !== mapWorkingLayer) {
            setRoot(createGroup());
            setMaxNumber(20);
            setSelectedExtent(extentList[0]?.value ?? "map_extent");
            setSearchResult([]);
            hasTriggeredDefaultSearch.current = false;
        }
        previousLayerRef.current = mapWorkingLayer;
    }, [mapWorkingLayer, extentList, setSearchResult]);

    useEffect(() => {
        if (!isModalOpen) {
            hasTriggeredDefaultSearch.current = false;
            return;
        }
        if (hasTriggeredDefaultSearch.current) return;
        hasTriggeredDefaultSearch.current = true;
        performSearch();
    }, [isModalOpen, performSearch]);

    const handleLoadSearch = useCallback(
        (search: SavedSearch) => {
            setRoot(search.searchRoot);
            setMaxNumber(search.searchMax);
            setSelectedExtent(search.searchExtent);
            setShowSavedSearches(false);
            addAlertMessage(StatusMessage.success, t("search_loaded_successfully"), 3000);
        },
        [setRoot, setMaxNumber, setSelectedExtent, addAlertMessage, t]
    );

    const onConfirm = useCallback(async () => {
        if (!community) return;
        searchModal.open();
        const success = await performSearch();
        if (!success) return;

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
        setLocalStorage(community.name, newLocalStoageData);
    }, [searchModal, performSearch, community, localStorageData, root, maxNumber, selectedExtent, setLocalStorage]);

    return (
        <>
            <ModaleComponent
                className="search-modal"
                modal={searchModal}
                title={t("search")}
                onClose={onClose}
                onConfirm={onConfirm}
                confirmText={t("search")}
                size="large"
            >
                <>
                    <div className="search-property">
                        {hasQueryableColumns && (
                            <>
                                <div className="saved-searches-toggle-header">
                                    <h5>{t("search_filters")}</h5>
                                    <Button
                                        iconId={showSavedSearches ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line"}
                                        priority="tertiary no outline"
                                        size="small"
                                        onClick={() => setShowSavedSearches(!showSavedSearches)}
                                    >
                                        {showSavedSearches ? t("hide_saved_searches") : t("show_saved_searches")}
                                    </Button>
                                </div>

                                {showSavedSearches && community?.name && mapWorkingLayer && (
                                    <div className="saved-searches-section">
                                        <SaveSearchForm
                                            t={t}
                                            communityName={community.name}
                                            workingLayer={mapWorkingLayer}
                                            root={root}
                                            maxNumber={maxNumber}
                                            selectedExtent={selectedExtent}
                                            onSaveComplete={() => loadLocalSavedSearches(community.name, mapWorkingLayer)}
                                        />
                                        <SavedSearchesList
                                            t={t}
                                            communityName={community.name}
                                            workingLayer={mapWorkingLayer}
                                            onLoadSearch={handleLoadSearch}
                                        />
                                    </div>
                                )}

                                <div className="search-filters-section">
                                    <SearchObjectsFilters t={t} root={root} setRoot={setRoot} />
                                </div>
                            </>
                        )}

                        <ConstraintsComponent
                            t={t}
                            extentList={extentList}
                            maxNumber={maxNumber}
                            setMaxNumber={setMaxNumber}
                            selectedExtent={selectedExtent}
                            setSelectedExtent={setSelectedExtent}
                        />
                        {isLoading && <LoaderComponent />}
                        {!isLoading && geoservice && <SearchTable geoservice={geoservice} />}
                    </div>
                </>
            </ModaleComponent>
            <ConfirmDeleteObjectModal />
        </>
    );
};

export default SearchObjectsModal;
