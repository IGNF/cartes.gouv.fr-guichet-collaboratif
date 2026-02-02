import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { CommunityGeoservice, CommunityLayerRoleType } from "@/constants/communities/types";
import { arrayToGeoJSON } from "@/constants/communities/utils";
import { ContributionType, FeatureTypeMode } from "@/constants/contributions/types";
import { SearchResultItem } from "@/constants/savedSearches/types";
import { resetContributionToMap } from "@/constants/contributions/utils";
import { handleCenterToFeature } from "@/constants/utils";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { Feature } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice?.columns?.find((c) => c.name === geoservice?.geometryName)?.crs ?? "EPSG:3857", [geoservice]);

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    const visibleColumns = useMemo(() => geoservice.columns.filter((col) => col.name !== geoservice.geometryName), [geoservice]);

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

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!tableWrapperRef.current) return;
        const target = e.target as HTMLElement;
        if (target.closest("button, input, label, a")) {
            return;
        }
        setIsDragging(true);
        setStartX(e.pageX - tableWrapperRef.current.offsetLeft);
        setStartY(e.pageY - tableWrapperRef.current.offsetTop);
        setScrollLeft(tableWrapperRef.current.scrollLeft);
        setScrollTop(tableWrapperRef.current.scrollTop);
        tableWrapperRef.current.classList.add("grabbing");
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
        if (tableWrapperRef.current) {
            tableWrapperRef.current.classList.remove("grabbing");
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (tableWrapperRef.current) {
            tableWrapperRef.current.classList.remove("grabbing");
        }
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging || !tableWrapperRef.current) return;
            e.preventDefault();
            const x = e.pageX - tableWrapperRef.current.offsetLeft;
            const y = e.pageY - tableWrapperRef.current.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            tableWrapperRef.current.scrollLeft = scrollLeft - walkX;
            tableWrapperRef.current.scrollTop = scrollTop - walkY;
        },
        [isDragging, startX, startY, scrollLeft, scrollTop]
    );

    const totalItems = searchResult.length;
    const totalPages = Math.ceil(totalItems / 20);

    const currentPageItems = sortedSearchResult.slice((page - 1) * 20, (page - 1) * 20 + 20);

    return (
        <>
            <Badge severity="info">{t("total_objects", { total: totalItems })}</Badge>
            {totalItems > 0 && (
                <>
                    <div
                        ref={tableWrapperRef}
                        className="search-table-container"
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    >
                        <table className="search-table fr-table">
                            <thead>
                                <tr>
                                    <th>
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
                                        />
                                    </th>
                                    {visibleColumns.map((col) => (
                                        <th key={col.name}>
                                            <div className="search-table-column-header">
                                                <Button
                                                    iconId={getSortIcon(col.name)}
                                                    priority="tertiary no outline"
                                                    onClick={() => handleSortChange(col.name)}
                                                >
                                                    {col.title || col.name}
                                                </Button>
                                            </div>
                                        </th>
                                    ))}
                                    <th>
                                        <div className="search-table-actions-header">{t("actions")}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPageItems.map((item) => (
                                    <tr key={item[`${geoservice.idName}`]}>
                                        <td>
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
                                            />
                                        </td>
                                        {visibleColumns.map((col) => (
                                            <td key={col.name}>
                                                <span style={{ color: getItemStyle(item) }}>
                                                    {item[col.name] !== null && item[col.name] !== undefined ? String(item[col.name]) : ""}
                                                </span>
                                            </td>
                                        ))}
                                        <td>
                                            <div className="search-table-actions">
                                                <Button
                                                    iconId="ri-eye-line"
                                                    title={t("show_object")}
                                                    priority="tertiary"
                                                    onClick={() => handleShowObject(item)}
                                                />
                                                {currentCommunityLayer?.role !== CommunityLayerRoleType.VISU && (
                                                    <Button
                                                        iconId="ri-pencil-line"
                                                        title={t("edit_object")}
                                                        priority="tertiary"
                                                        onClick={() => handleModifyObject(item)}
                                                    />
                                                )}
                                                <Button
                                                    iconId={getItemStyle(item) === "red" ? "ri-refresh-line" : "ri-delete-bin-line"}
                                                    title={getItemStyle(item) === "red" ? t("cancel") : t("delete_object")}
                                                    priority="tertiary"
                                                    nativeButtonProps={getItemStyle(item) === "red" ? undefined : confirmDeleteObjectSearchModal.buttonProps}
                                                    onClick={() => handleDeleteObject(item)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
