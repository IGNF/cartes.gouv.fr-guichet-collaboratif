import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { CommunityGeoservice, CommunityLayerRoleType } from "@/constants/communities/types";
import { arrayToGeoJSON } from "@/constants/communities/utils";
import { ContributionType, FeatureTypeMode, SearchResultItem } from "@/constants/contributions/types";
import { resetContributionToMap } from "@/constants/contributions/utils";
import { handleCenterToFeature } from "@/constants/utils";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import Table from "@codegouvfr/react-dsfr/Table";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
    geoservice: CommunityGeoservice;
}

const SearchTable: React.FC<Props> = ({ geoservice }) => {
    const { map, mapWorkingLayer, setClickedMapFeature } = useMapStore();
    const { confirmDeleteObjectSearchModal, searchModal } = useModalStore();
    const { searchResult, contributions, selectedObjects, setFeatureTypeMode, setSearchItemToDelete, setContributions, setSelectedObjects } =
        useContributionStore();
    const { communityLayers } = useCommunityStore();

    const { t } = useTranslation({ SearchTable });

    const [checkedObjects, setCheckedObjects] = useState<SearchResultItem[]>([]);
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<{ value: string; desc: boolean }>({ value: geoservice?.idName ?? "id", desc: false });

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice?.columns?.find((c) => c.name === geoservice?.geometryName)?.crs ?? "EPSG:3857", [geoservice]);

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    const sortedSearchResult = useMemo(
        () =>
            searchResult.sort((el1: SearchResultItem, el2: SearchResultItem) => {
                if (typeof el1[`${sortBy.value}`] === "number")
                    return sortBy.desc
                        ? (el1[`${sortBy.value}`] as number) - (el2[`${sortBy.value}`] as number)
                        : (el2[`${sortBy.value}`] as number) - (el1[`${sortBy.value}`] as number);
                return sortBy.desc
                    ? ((el1[`${sortBy.value}`] as string) ?? "").localeCompare((el2[`${sortBy.value}`] as string) ?? "")
                    : ((el2[`${sortBy.value}`] as string) ?? "").localeCompare((el1[`${sortBy.value}`] as string) ?? "");
            }),
        [searchResult, sortBy]
    );

    const handleSortChange = useCallback(
        (sortByName: string) => {
            setSortBy({
                value: sortByName,
                desc: sortBy.value === sortByName ? !sortBy.desc : false,
            });
        },
        [sortBy]
    );

    const getSortIcon = useCallback(
        (name: string) => {
            return sortBy.value === name && !sortBy.desc ? "fr-icon-sort-desc" : "fr-icon-sort-asc";
        },
        [sortBy]
    );

    const isItemInSource = useCallback(
        (item: SearchResultItem) => {
            const sourceFeature = clickableSource
                .getFeatures()
                .find((feat) => feat.get(FEATURE_TYPE_DATA_PROPERTY)![`${geoservice.idName}`] === item[`${geoservice.idName}`]);
            return sourceFeature;
        },
        [clickableSource, geoservice]
    );

    const addItemToSource = useCallback(
        (item: SearchResultItem) => {
            const featExist = isItemInSource(item);
            if (featExist) return [featExist];
            const features = new GeoJSON().readFeatures(arrayToGeoJSON([item], geoservice), {
                dataProjection: geoProjCode,
                featureProjection: mapProjCode,
            });
            clickableSource?.addFeatures(features);
            return features;
        },
        [clickableSource, geoProjCode, geoservice, mapProjCode, isItemInSource]
    );

    const handleShowObject = useCallback(
        (item: SearchResultItem) => {
            const sourceFeature = isItemInSource(item);
            if (sourceFeature) {
                handleCenterToFeature(map, sourceFeature);
                setClickedMapFeature(sourceFeature);
                searchModal.close();
            } else {
                addItemToSource(item);
                handleShowObject(item);
            }
        },
        [map, searchModal, setClickedMapFeature, addItemToSource, isItemInSource]
    );

    const handleModifyObject = useCallback(
        (item: SearchResultItem) => {
            if (checkedObjects.length > 2) {
                const newFeats: Feature[] = [];
                checkedObjects.forEach((el) => {
                    newFeats.push(...addItemToSource(el));
                });
                setSelectedObjects([...selectedObjects, ...newFeats]);
            }
            const sourceFeature = isItemInSource(item);
            if (sourceFeature) {
                handleCenterToFeature(map, sourceFeature!);
                setClickedMapFeature(sourceFeature);
                setFeatureTypeMode(FeatureTypeMode.EDIT);
                searchModal.close();
            } else {
                handleShowObject(item);
                handleModifyObject(item);
            }
        },
        [
            map,
            searchModal,
            checkedObjects,
            selectedObjects,
            setClickedMapFeature,
            handleShowObject,
            setFeatureTypeMode,
            isItemInSource,
            addItemToSource,
            setSelectedObjects,
        ]
    );

    const getItemStyle = useCallback(
        (item: SearchResultItem) => {
            const itemExist = contributions.find(
                (contr) => contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)![`${geoservice.idName}`] === item[`${geoservice.idName}`]
            );
            if (itemExist) {
                switch (itemExist.type) {
                    case ContributionType.DELETE:
                        return "red";
                    case ContributionType.MODIFY:
                        return "orange";
                    default:
                        return "";
                }
            }
        },
        [contributions, geoservice]
    );

    useEffect(() => {
        if (page !== 0) setPage(1);
    }, [searchResult]);

    const handleDeleteObject = useCallback(
        (item: SearchResultItem) => {
            if (getItemStyle(item) === "red") {
                const itemContr = contributions.find(
                    (contr) => contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)![`${geoservice.idName}`] === item[`${geoservice.idName}`]
                );
                if (map && itemContr) {
                    resetContributionToMap(map, itemContr);
                    setContributions(contributions.filter((c) => c !== itemContr));
                    return;
                }
            }
            const sourceFeature = clickableSource
                .getFeatures()
                .find((feat) => feat.get(FEATURE_TYPE_DATA_PROPERTY)![`${geoservice.idName}`] === item[`${geoservice.idName}`]);

            if (sourceFeature) {
                setSearchItemToDelete(sourceFeature);
            } else {
                addItemToSource(item);
                handleDeleteObject(item);
            }
        },
        [clickableSource, geoservice, contributions, map, setSearchItemToDelete, addItemToSource, getItemStyle, setContributions]
    );

    const handleSelectObject = useCallback(
        (item: SearchResultItem | null) => {
            if (!item) {
                if (checkedObjects.length !== searchResult.length) {
                    setCheckedObjects(searchResult);
                } else {
                    setCheckedObjects([]);
                }
                return;
            }
            if (checkedObjects.includes(item)) {
                setCheckedObjects((prev) => prev.filter((el) => el !== item));
            } else {
                setCheckedObjects((prev) => [...prev, item]);
            }
        },
        [checkedObjects, searchResult]
    );

    const totalItems = searchResult.length;
    const totalPages = Math.ceil(totalItems / 20);

    const currentPageItems = sortedSearchResult.slice((page - 1) * 20, (page - 1) * 20 + 20);

    return (
        <>
            {totalItems > 0 && (
                <>
                    <Badge severity="info">{t("total_objects", { total: totalItems })}</Badge>
                    <Table
                        className="search-table"
                        fixed
                        data={currentPageItems.map((item) => [
                            <Checkbox
                                options={[
                                    {
                                        label: "",
                                        nativeInputProps: {
                                            name: "select-item",
                                            value: item[`${geoservice.idName}`],
                                            checked: checkedObjects.includes(item),
                                            onChange: () => handleSelectObject(item),
                                        },
                                    },
                                ]}
                            />,
                            <span style={{ color: getItemStyle(item) }}>{item[`${geoservice?.idName}`]}</span>,
                            <span style={{ color: getItemStyle(item) }}>{item.nature}</span>,
                            <span style={{ color: getItemStyle(item) }}>{item.categorie}</span>,
                            <span style={{ color: getItemStyle(item) }}>{item.commune}</span>,
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button iconId="ri-eye-line" title={t("show_object")} priority="tertiary" onClick={() => handleShowObject(item)} />
                                {currentCommunityLayer?.role !== CommunityLayerRoleType.VISU && (
                                    <Button iconId="ri-pencil-line" title={t("edit_object")} priority="tertiary" onClick={() => handleModifyObject(item)} />
                                )}
                                <Button
                                    iconId={getItemStyle(item) === "red" ? "ri-refresh-line" : "ri-delete-bin-line"}
                                    title={getItemStyle(item) === "red" ? t("cancel") : t("delete_object")}
                                    priority="tertiary"
                                    style={{ color: getItemStyle(item) === "red" ? "orange" : "red" }}
                                    nativeButtonProps={getItemStyle(item) === "red" ? undefined : confirmDeleteObjectSearchModal.buttonProps}
                                    onClick={() => handleDeleteObject(item)}
                                />
                            </div>,
                        ])}
                        headers={[
                            <Checkbox
                                options={[
                                    {
                                        label: "",
                                        nativeInputProps: {
                                            name: "select-all",
                                            value: "all",
                                            checked: checkedObjects.length === searchResult.length,
                                            onChange: () => handleSelectObject(null),
                                        },
                                    },
                                ]}
                            />,
                            <Button
                                iconId={getSortIcon(geoservice?.idName ?? "id")}
                                priority="tertiary no outline"
                                onClick={() => handleSortChange(geoservice?.idName ?? "id")}
                            >
                                {geoservice?.idName}
                            </Button>,
                            <Button iconId={getSortIcon("nature")} priority="tertiary no outline" onClick={() => handleSortChange("nature")}>
                                Nature
                            </Button>,
                            <Button iconId={getSortIcon("categorie")} priority="tertiary no outline" onClick={() => handleSortChange("categorie")}>
                                Catégorie
                            </Button>,
                            <Button iconId={getSortIcon("commune")} priority="tertiary no outline" onClick={() => handleSortChange("commune")}>
                                Commune
                            </Button>,
                            t("actions"),
                        ]}
                    />
                </>
            )}
            {totalItems > 20 && (
                <Pagination
                    key={page}
                    count={totalPages}
                    defaultPage={page || 1}
                    getPageLinkProps={(pageNumber: number) => {
                        return {
                            href: `?page=${pageNumber}`,
                            "aria-label": t("go_to_page", { pageNumber }),

                            onClick: (e) => {
                                e.preventDefault();
                                setPage(pageNumber);
                            },
                        };
                    }}
                    showFirstLast
                    className="search-pagination"
                />
            )}
        </>
    );
};

export default SearchTable;
