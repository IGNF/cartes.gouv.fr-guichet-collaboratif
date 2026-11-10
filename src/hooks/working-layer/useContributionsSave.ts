import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";
import VectorSource from "ol/source/Vector";

import { useCommunityStore, useContributionStore, useMapStore, useUserStore } from "@/store";
import { useLang } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_FINGERPRINT_COLUMN, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { Contribution, ContributionType, TransactionApi, TransactionStatus, TransactionType } from "@/constants/contributions/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { resetContributionToMap, areEqual, setFeatNewCoords } from "@/constants/contributions/utils";
import { postTransactions } from "@/api/transactionData";
import { normalizeColumnEnum } from "@/constants/communities/utils";

interface UseContributionsSaveOptions {
    pendingMessage: string;
    successMessage: string;
    errorMessage: string;
    missingConfigurationMessage: string;
}

const matchGeometryColumnType = (wkt: string, columnType?: string) => {
    const normalizedColumnType = columnType?.toLowerCase();
    const polygonMatch = /^POLYGON(?:\s+(ZM|Z|M))?\s*(\(.*\))$/i.exec(wkt);
    if (normalizedColumnType?.includes("multipolygon") && polygonMatch) {
        const dimension = polygonMatch[1] ? ` ${polygonMatch[1].toUpperCase()}` : "";
        return `MULTIPOLYGON${dimension}(${polygonMatch[2]})`;
    }

    const lineMatch = /^LINESTRING(?:\s+(ZM|Z|M))?\s*(\(.*\))$/i.exec(wkt);
    if (normalizedColumnType?.includes("multilinestring") && lineMatch) {
        const dimension = lineMatch[1] ? ` ${lineMatch[1].toUpperCase()}` : "";
        return `MULTILINESTRING${dimension}(${lineMatch[2]})`;
    }

    return wkt;
};

export function useContributionsSave({ pendingMessage, successMessage, errorMessage, missingConfigurationMessage }: UseContributionsSaveOptions) {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl } = useMapStore();
    const { contributions, contrToCancel, setReviewContribution, setContributions, setContrToCancel, setSelectedObjects } = useContributionStore();
    const { addAlertMessage, removeAlertMessage } = useCommunityStore();
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

    /**
     * The transaction response only echoes the data that was sent: it does not hold the gcms_fingerprint recomputed
     * by the server after the commit, nor the server state of an inserted feature. Keeping the local features would
     * make the next transaction on them fail (stale or missing fingerprint), so the saved layers are reloaded.
     */
    const refreshSavedLayers = useCallback(
        (savedContributions: Contribution[]) => {
            const layerNames = new Set(savedContributions.map((contr) => contr.layer));
            map?.getAllLayers().forEach((layer) => {
                if (!layerNames.has(layer.get("name"))) return;
                const source = layer.getSource();
                if (source instanceof VectorSource) source.refresh();
            });
        },
        [map]
    );

    const handleSuccess = useCallback(() => {
        setContributions([]);
        setSelectedObjects([]);
        setWorkingLayerDrawerOpened(false);
        setClickedMapFeature(null);
        setClickedControl(null);
        addAlertMessage(StatusMessage.success, successMessage, 2000);
    }, [setContributions, setSelectedObjects, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl, addAlertMessage, successMessage]);

    const handleError = useCallback(
        (failedStatuses: TransactionStatus[], failedContributions: Contribution[], hasRefreshedLayers: boolean) => {
            const errorMessages = failedStatuses.map((s) => s.message || "Unknown error").join("; ");
            addAlertMessage(StatusMessage.error, errorMessage + ": " + errorMessages);
            setContributions(failedContributions);
            // The features of the refreshed layers were replaced: the selection may hold features that are no longer on the map
            if (hasRefreshedLayers) {
                setSelectedObjects([]);
                setClickedMapFeature(null);
            }
        },
        [setContributions, setSelectedObjects, setClickedMapFeature, addAlertMessage, errorMessage]
    );

    const onSave = useCallback(async () => {
        const validator = useContributionStore.getState().pendingFeatureFormValidator;
        if (validator?.() === false) return;

        const { contributions } = useContributionStore.getState();
        const apis: TransactionApi[] = [];
        const today = new Date();

        for (const contr of contributions) {
            const feat = contr.feature;
            const featData = feat.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown>;
            const initialFeatData = contr.initialFeature?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
            const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
            const { database, table } = geoservice;
            if (database === undefined || table === undefined) {
                addAlertMessage(StatusMessage.error, missingConfigurationMessage);
                return;
            }

            verifyFeatData(featData, geoservice);
            const geometryNameColumn = geoservice.columns.find((c) => c.name === geoservice.geometryName);
            const featProj = geometryNameColumn?.crs;
            const apiExist = apis.find((api) => api.database === database);
            const force2d = geometryNameColumn?.is3d !== true;
            if (!force2d) setFeatNewCoords(feat, contr.initialFeature ?? undefined);

            const featGeometry = matchGeometryColumnType(getFeatureGeometryWKT(feat, mapProj, featProj, force2d), geometryNameColumn?.type);
            const initialGeometry = contr.initialFeature
                ? matchGeometryColumnType(getFeatureGeometryWKT(contr.initialFeature, mapProj, featProj, force2d), geometryNameColumn?.type)
                : undefined;
            const columnsByName = new Map(geoservice.columns.map((column) => [column.name, column]));
            const filteredFeatData: Record<string, unknown> = {};
            Object.entries(featData).forEach(([key, value]) => {
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

        setIsLoading(true);
        const pendingId = addAlertMessage(StatusMessage.info, pendingMessage);
        try {
            const postResAll = await postTransactions(apis);
            const transactionStatuses: TransactionStatus[] = postResAll.map((res) => res.data);
            const failedStatuses = transactionStatuses.filter((s) => s.status !== TransactionType.COMMITTED);
            // One transaction per database, in the same order as apis. A transaction that is not committed is fully
            // rolled back, so every contribution of its database is still to be saved.
            const failedDatabases = new Set<number | undefined>(
                apis.filter((_, index) => transactionStatuses[index]?.status !== TransactionType.COMMITTED).map((api) => api.database)
            );
            const isFailed = (contr: Contribution) => failedDatabases.has(contr.feature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.database);

            const savedContributions = contributions.filter((contr) => !isFailed(contr));
            refreshSavedLayers(savedContributions);
            if (failedStatuses.length === 0) handleSuccess();
            else handleError(failedStatuses, contributions.filter(isFailed), savedContributions.length > 0);
        } catch (error) {
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
        refreshSavedLayers,
        handleSuccess,
        handleError,
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
