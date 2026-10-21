import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";

import { useCommunityStore, useContributionStore, useMapStore, useUserStore } from "@/store";
import { useLang } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_FINGERPRINT_COLUMN, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { Contribution, ContributionType, TransactionApi, TransactionStatus, TransactionType } from "@/constants/contributions/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { resetContributionToMap, areEqual } from "@/constants/contributions/utils";
import { postTransactions } from "@/api/transactionData";
import { createCommunityDocument, deleteCommunityDocument } from "@/api/documentData";
import { normalizeColumnEnum } from "@/constants/communities/utils";

interface UseContributionsSaveOptions {
    pendingMessage: string;
    successMessage: string;
    errorMessage: string;
    missingConfigurationMessage: string;
}

const matchGeometryColumnType = (wkt: string, columnType?: string) => {
    const normalizedColumnType = columnType?.toLowerCase();
    if (normalizedColumnType?.includes("multipolygon") && /^POLYGON\s*\(/i.test(wkt)) {
        return wkt.replace(/^POLYGON\s*(\(.*\))$/i, "MULTIPOLYGON($1)");
    }
    if (normalizedColumnType?.includes("multilinestring") && /^LINESTRING\s*\(/i.test(wkt)) {
        return wkt.replace(/^LINESTRING\s*(\(.*\))$/i, "MULTILINESTRING($1)");
    }
    return wkt;
};

const getDocumentId = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        if (/^\d+$/.test(value)) return Number(value);
        try {
            return getDocumentId(JSON.parse(value));
        } catch {
            return null;
        }
    }
    if (typeof value === "object" && value !== null && "id" in value) {
        const id = Number(value.id);
        return Number.isFinite(id) ? id : null;
    }
    return null;
};

const getLocalDocumentFile = (value: unknown): File | null => {
    if (value instanceof File) return value;
    if (Array.isArray(value) && value[0] instanceof File) return value[0];
    return null;
};

interface UploadedDocument {
    database: number;
    newDocumentId: number;
    oldDocumentId: number | null;
    contribution: Contribution;
    columnName: string;
}

interface PendingDocumentDeletion {
    database: number;
    documentId: number;
}

export function useContributionsSave({ pendingMessage, successMessage, errorMessage, missingConfigurationMessage }: UseContributionsSaveOptions) {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl } = useMapStore();
    const { contributions, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();
    const { community, addAlertMessage, removeAlertMessage } = useCommunityStore();
    const { user } = useUserStore();
    const { lang } = useLang();
    const [isLoading, setIsLoading] = useState(false);

    const mapProj = useMemo(() => map?.getView()?.getProjection().getCode(), [map]);

    const verifyFeatData = useCallback((featData: Record<string, unknown>, geoservice: CommunityGeoservice) => {
        geoservice.columns.forEach((col) => {
            const enumValues = normalizeColumnEnum(col.enum);
            const fieldValue = featData[col.name];
            if (enumValues.length > 0 && fieldValue !== null && fieldValue !== undefined && fieldValue !== "") {
                if (!enumValues.includes(fieldValue as string | number | null)) featData[col.name] = col.default_value;
            }
        });
    }, []);

    const finishSuccessfulSave = useCallback(() => {
        setContributions([]);
        setWorkingLayerDrawerOpened(false);
        setClickedMapFeature(null);
        setClickedControl(null);
        addAlertMessage(StatusMessage.success, successMessage, 2000);
    }, [setContributions, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl, addAlertMessage, successMessage]);

    const onSave = useCallback(async () => {
        const validator = useContributionStore.getState().pendingFeatureFormValidator;
        if (validator?.() === false) return;

        const { contributions } = useContributionStore.getState();
        const apis: TransactionApi[] = [];
        const today = new Date();
        const geomContr: { contr: Contribution; geom: string }[] = [];
        const uploadedDocuments: UploadedDocument[] = [];
        const pendingDocumentDeletions: PendingDocumentDeletion[] = [];
        let transactionsSettled = false;

        setIsLoading(true);
        const pendingId = addAlertMessage(StatusMessage.info, pendingMessage);
        try {
            for (const contr of contributions) {
                const feat = contr.feature;
                const featData = feat.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown>;
                const initialFeatData = contr.initialFeature?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
                const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
                const { database, table } = geoservice;
                if (database === undefined || table === undefined) {
                    throw new Error(missingConfigurationMessage);
                }

                const transactionFeatData = { ...featData };
                for (const column of geoservice.columns.filter((currentColumn) => currentColumn.type.toLowerCase() === "document")) {
                    const currentValue = transactionFeatData[column.name];
                    const localFile = getLocalDocumentFile(currentValue);
                    const oldDocumentId = getDocumentId(initialFeatData?.[column.name]);

                    if (localFile) {
                        if (!community) throw new Error(missingConfigurationMessage);
                        const uploadedDocument = await createCommunityDocument(community.id, localFile);
                        transactionFeatData[column.name] = uploadedDocument.id;
                        uploadedDocuments.push({
                            database,
                            newDocumentId: uploadedDocument.id,
                            oldDocumentId,
                            contribution: contr,
                            columnName: column.name,
                        });
                    } else if ((currentValue === null || currentValue === "") && oldDocumentId !== null) {
                        pendingDocumentDeletions.push({ database, documentId: oldDocumentId });
                    }
                }

                verifyFeatData(transactionFeatData, geoservice);
                const geometryNameColumn = geoservice.columns.find((c) => c.name === geoservice.geometryName);
                const featProj = geometryNameColumn?.crs;
                const apiExist = apis.find((api) => api.database === database);
                const featGeometry = matchGeometryColumnType(getFeatureGeometryWKT(feat, mapProj, featProj, true), geometryNameColumn?.type);
                const initialGeometry = contr.initialFeature
                    ? matchGeometryColumnType(getFeatureGeometryWKT(contr.initialFeature, mapProj, featProj, true), geometryNameColumn?.type)
                    : undefined;
                const columnsByName = new Map(geoservice.columns.map((column) => [column.name, column]));
                const filteredFeatData: Record<string, unknown> = {};
                Object.entries(transactionFeatData).forEach(([key, value]) => {
                    const column = columnsByName.get(key);
                    if (!column) {
                        if (key === FEATURE_TYPE_FINGERPRINT_COLUMN) filteredFeatData[key] = value;
                        return;
                    }

                    const isIdentifier = key === geoservice.idName;
                    const isChanged = !areEqual(value, initialFeatData?.[key]);
                    if (contr.type !== ContributionType.CREATE && !isIdentifier && !isChanged) return;
                    if (contr.type === ContributionType.CREATE && value === "" && !column.required) return;

                    const columnType = column.type.toLowerCase();
                    filteredFeatData[key] = columnType === "datetime" && typeof value === "string" ? value.slice(0, 19).replace("T", " ") : value;
                });
                if (contr.type === ContributionType.CREATE || featGeometry !== initialGeometry) {
                    filteredFeatData[`${geoservice.geometryName}`] = featGeometry;
                }
                const action = {
                    table,
                    state: contr.type,
                    data: filteredFeatData,
                };
                geomContr.push({ contr, geom: featGeometry });
                if (apiExist) {
                    apiExist.body.actions.push(action);
                } else {
                    apis.push({
                        database,
                        body: {
                            comment: `Transaction ajoutée par l'utilisateur ${user?.username} ; date et heure : ${today.toLocaleDateString(lang, { formatMatcher: "best fit" })} ${today.toLocaleTimeString(lang)} (code : wfsTransactions)`,
                            actions: [action],
                        },
                    });
                }
            }

            const postResAll = await postTransactions(apis);
            transactionsSettled = true;
            const settledTransactions: { database: number; status: TransactionStatus }[] = [];
            const committedDatabases = new Set<number>();
            const failedDatabases = new Set<number>();
            const uncertainDatabases = new Set<number>();
            const requestErrors: unknown[] = [];
            postResAll.forEach((result, index) => {
                const { database } = apis[index];
                if (result.status === "fulfilled") {
                    settledTransactions.push({ database, status: result.value.data });
                    if (result.value.data.status === TransactionType.COMMITTED) {
                        committedDatabases.add(database);
                    } else {
                        failedDatabases.add(database);
                    }
                } else {
                    requestErrors.push(result.reason);
                    uncertainDatabases.add(database);
                }
            });

            settledTransactions
                .filter(({ status }) => status.status === TransactionType.COMMITTED)
                .forEach(({ database, status }) => {
                    status.actions.forEach((action) => {
                        const contr = geomContr.find((gc) => {
                            const feat = gc.contr.feature;
                            const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
                            if (!geoservice?.geometryName) return false;
                            return geoservice.database === database && gc.geom === action.data[geoservice.geometryName];
                        })?.contr;
                        if (contr) {
                            contr.feature.set(FEATURE_TYPE_DATA_PROPERTY, action.data);
                            contr.feature.setProperties(action.data);
                            contr.feature.unset(FEATURE_TYPE_NEW_PROPERTY);
                        }
                    });
                });

            uploadedDocuments
                .filter(({ database }) => uncertainDatabases.has(database))
                .forEach(({ contribution, columnName, newDocumentId }) => {
                    const featureData = contribution.feature.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown>;
                    const updatedFeatureData = { ...featureData, [columnName]: newDocumentId };
                    contribution.feature.set(FEATURE_TYPE_DATA_PROPERTY, updatedFeatureData);
                    contribution.feature.set(columnName, newDocumentId);
                    contribution.feature.changed();
                });

            const documentIdsToDelete = new Set<number>();
            uploadedDocuments.forEach(({ database, newDocumentId, oldDocumentId }) => {
                if (committedDatabases.has(database)) {
                    if (oldDocumentId !== null) documentIdsToDelete.add(oldDocumentId);
                } else if (failedDatabases.has(database)) {
                    documentIdsToDelete.add(newDocumentId);
                }
            });
            pendingDocumentDeletions.forEach(({ database, documentId }) => {
                if (committedDatabases.has(database)) documentIdsToDelete.add(documentId);
            });

            if (community) {
                const deletionErrors: unknown[] = [];
                for (const documentId of documentIdsToDelete) {
                    try {
                        await deleteCommunityDocument(community.id, documentId);
                    } catch (error) {
                        deletionErrors.push(error);
                    }
                }
                if (deletionErrors.length > 0) {
                    addAlertMessage(StatusMessage.error, `${errorMessage}: ${deletionErrors.map(String).join("; ")}`, 5000);
                }
            }

            if (requestErrors.length > 0) {
                const message = requestErrors.map((e) => (e instanceof AxiosError ? e.response?.data?.message || e.message : String(e))).join("; ");
                addAlertMessage(StatusMessage.error, `${errorMessage}: ${message}`, 5000);
            }
            const transactionStatuses = settledTransactions.map(({ status }) => status);
            const allSuccess = requestErrors.length === 0 && transactionStatuses.every((s) => s.status === TransactionType.COMMITTED);
            const failedStatuses = transactionStatuses.filter((s) => s.status !== TransactionType.COMMITTED);
            if (allSuccess) {
                finishSuccessfulSave();
            } else {
                const remainingContributions = contributions.filter((contribution) => {
                    const geoservice = contribution.feature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY) as CommunityGeoservice;
                    return geoservice.database === undefined || !committedDatabases.has(geoservice.database);
                });
                setContributions(remainingContributions);

                if (failedStatuses.length > 0) {
                    const statusErrors = failedStatuses.map((status) => status.message || "Unknown error").join("; ");
                    addAlertMessage(StatusMessage.error, `${errorMessage}: ${statusErrors}`, 5000);
                }
            }
        } catch (error) {
            if (community && !transactionsSettled) {
                for (const { newDocumentId } of uploadedDocuments) {
                    try {
                        await deleteCommunityDocument(community.id, newDocumentId);
                    } catch (cleanupError) {
                        addAlertMessage(StatusMessage.error, `${errorMessage}: ${String(cleanupError)}`, 5000);
                    }
                }
            }
            if (error instanceof AxiosError) {
                addAlertMessage(StatusMessage.error, error.response?.data?.message || error.message, 5000);
            } else {
                addAlertMessage(StatusMessage.error, String(error), 5000);
            }
        } finally {
            setIsLoading(false);
            removeAlertMessage(pendingId);
        }
    }, [
        user,
        lang,
        mapProj,
        verifyFeatData,
        addAlertMessage,
        removeAlertMessage,
        pendingMessage,
        missingConfigurationMessage,
        finishSuccessfulSave,
        community,
        errorMessage,
        setContributions,
    ]);

    const onClickReset = useCallback(() => {
        contrToCancel.forEach((contr) => resetContributionToMap(map!, contr));
        setReviewContribution(false);
        setWorkingLayerDrawerOpened(false);
        setClickedMapFeature(null);
        setClickedControl(null);
        setContributions(contributions.filter((c) => !contrToCancel.includes(c)));
        setContrToCancel([]);
    }, [
        map,
        contrToCancel,
        contributions,
        setContributions,
        setReviewContribution,
        setClickedMapFeature,
        setWorkingLayerDrawerOpened,
        setContrToCancel,
        setClickedControl,
    ]);

    return { onSave, onClickReset, isLoading };
}
