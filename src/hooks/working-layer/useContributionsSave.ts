import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";

import { useCommunityStore, useContributionStore, useMapStore, useUserStore } from "@/store";
import { useLang } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_FINGERPRINT_COLUMN, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { Contribution, ContributionType, TransactionApi, TransactionStatus, TransactionAction, TransactionType } from "@/constants/contributions/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { resetContributionToMap, areEqual } from "@/constants/contributions/utils";
import { postTransactions } from "@/api/transactionData";
import { normalizeColumnEnum } from "@/constants/communities/utils";

interface UseContributionsSaveOptions {
    pendingMessage: string;
    successMessage: string;
    errorMessage: string;
    missingConfigurationMessage: string;
}

export function useContributionsSave({ pendingMessage, successMessage, errorMessage, missingConfigurationMessage }: UseContributionsSaveOptions) {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl } = useMapStore();
    const { contributions, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();
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

    const handleSuccess = useCallback(
        (transactionStatuses: TransactionStatus[], geomContr: { contr: Contribution; geom: string }[]) => {
            transactionStatuses.forEach((status: TransactionStatus) => {
                status.actions.forEach((action: TransactionAction) => {
                    const contr = geomContr.find((gc) => {
                        const feat = gc.contr.feature;
                        const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
                        if (!geoservice?.geometryName) return false;
                        return gc.geom === action.data[geoservice.geometryName];
                    })?.contr;
                    if (contr) {
                        contr.feature.set(FEATURE_TYPE_DATA_PROPERTY, action.data);
                        contr.feature.unset(FEATURE_TYPE_NEW_PROPERTY);
                    }
                });
            });
            setContributions([]);
            setWorkingLayerDrawerOpened(false);
            setClickedMapFeature(null);
            setClickedControl(null);
            addAlertMessage(StatusMessage.success, successMessage, 2000);
        },
        [setContributions, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl, addAlertMessage, successMessage]
    );

    const handleError = useCallback(
        (failedStatuses: TransactionStatus[], geomContr: { contr: Contribution; geom: string }[]) => {
            const errorMessages = failedStatuses.map((s) => s.message || "Unknown error").join("; ");
            addAlertMessage(StatusMessage.error, errorMessage + ": " + errorMessages);
            const failedGeoms = failedStatuses
                .flatMap((s) => s.actions.map((a: TransactionAction) => a.data))
                .map((data) =>
                    Object.values(data).find((v) => typeof v === "string" && (v.startsWith("POINT") || v.startsWith("LINESTRING") || v.startsWith("POLYGON")))
                );
            const failedContributions = geomContr.filter((gc) => failedGeoms.includes(gc.geom)).map((gc) => gc.contr);
            setContributions(failedContributions);
        },
        [setContributions, addAlertMessage, errorMessage]
    );

    const onSave = useCallback(async () => {
        const validator = useContributionStore.getState().pendingFeatureFormValidator;
        if (validator?.() === false) return;

        const { contributions } = useContributionStore.getState();
        const apis: TransactionApi[] = [];
        const today = new Date();
        const geomContr: { contr: Contribution; geom: string }[] = [];

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
            const geometryWKT = getFeatureGeometryWKT(feat, mapProj, featProj);
            const featGeometry =
                geometryNameColumn?.is3d && !geometryWKT.match(/^[A-Z]+ Z(?:M)?\b/) ? geometryWKT.replace(/^([A-Z]+)(?=\s*\()/, "$1 Z") : geometryWKT;
            const initialGeometry = contr.initialFeature ? getFeatureGeometryWKT(contr.initialFeature, mapProj, featProj) : undefined;
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

                filteredFeatData[key] = column.type.toLowerCase() === "datetime" && typeof value === "string" ? value.slice(0, 19).replace("T", " ") : value;
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

        setIsLoading(true);
        const pendingId = addAlertMessage(StatusMessage.info, pendingMessage);
        try {
            const postResAll = await postTransactions(apis);
            const transactionStatuses: TransactionStatus[] = postResAll.map((res) => res.data);
            const allSuccess = transactionStatuses.every((s) => s.status === TransactionType.COMMITTED);
            const failedStatuses = transactionStatuses.filter((s) => s.status !== TransactionType.COMMITTED);
            if (allSuccess) handleSuccess(transactionStatuses, geomContr);
            else handleError(failedStatuses, geomContr);
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
    }, [user, lang, mapProj, verifyFeatData, addAlertMessage, removeAlertMessage, pendingMessage, missingConfigurationMessage, handleSuccess, handleError]);

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
