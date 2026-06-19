import { useCallback, useMemo, useState } from "react";
import { AxiosError } from "axios";

import { useCommunityStore, useContributionStore, useMapStore, useUserStore } from "@/store";
import { useLang } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_NEW_PROPERTY } from "@/constants";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { Contribution, TransactionStatus, TransactionAction, TransactionType } from "@/constants/contributions/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { resetContributionToMap } from "@/constants/contributions/utils";
import { postTransactions } from "@/api/transactionData";

interface UseContributionsSaveOptions {
    pendingMessage: string;
    successMessage: string;
    errorMessage: string;
}

export function useContributionsSave({ pendingMessage, successMessage, errorMessage }: UseContributionsSaveOptions) {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl } = useMapStore();
    const { contributions, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();
    const { addAlertMessage, removeAlertMessage } = useCommunityStore();
    const { user } = useUserStore();
    const { lang } = useLang();

    const [isLoading, setIsLoading] = useState(false);

    const mapProj = useMemo(() => map?.getView()?.getProjection().getCode(), [map]);

    const verifyFeatData = useCallback((featData: Record<string, unknown>, geoservice: CommunityGeoservice) => {
        geoservice.columns.forEach((col) => {
            if (col.enum && featData[col.name]) {
                if (!col.enum.includes(featData[col.name] as string)) featData[col.name] = col.default_value;
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
            addAlertMessage(StatusMessage.success, successMessage);
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
        setIsLoading(true);
        const apis: { database: number; body: { comment: string; actions: object[] } }[] = [];
        const today = new Date();
        const geomContr: { contr: Contribution; geom: string }[] = [];

        contributions.forEach((contr) => {
            const feat = contr.feature;
            const featData = feat.get(FEATURE_TYPE_DATA_PROPERTY);
            const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
            verifyFeatData(featData, geoservice);
            const geometryNameColumn = geoservice.columns.find((c) => c.name === geoservice.geometryName);
            const featProj = geometryNameColumn?.crs;
            if (!geoservice.database) return;
            const apiExist = apis.find((api) => api.database === geoservice.database);
            let featGeometry = getFeatureGeometryWKT(feat, mapProj, featProj);
            if (geometryNameColumn?.is3d && featGeometry.includes(" Z")) featGeometry = featGeometry.replace(" Z", "");
            const validColumnNames = new Set(geoservice.columns.map((c) => c.name));
            const filteredFeatData: Record<string, unknown> = {};
            Object.entries(featData).forEach(([key, value]) => {
                if (validColumnNames.has(key)) filteredFeatData[key] = value;
            });
            const action = {
                table: geoservice.table,
                state: contr.type,
                data: { ...filteredFeatData, [`${geoservice.geometryName}`]: featGeometry },
            };
            geomContr.push({ contr, geom: featGeometry });
            if (apiExist) {
                apiExist.body.actions.push(action);
            } else {
                apis.push({
                    database: geoservice.database,
                    body: {
                        comment: `Transaction ajoutée par l'utilisateur ${user?.username} ; date et heure : ${today.toLocaleDateString(lang, { formatMatcher: "best fit" })} ${today.toLocaleTimeString(lang)} (code : wfsTransactions)`,
                        actions: [action],
                    },
                });
            }
        });

        try {
            const pendingId = addAlertMessage(StatusMessage.info, pendingMessage);
            const postResAll = await postTransactions(apis);
            setIsLoading(false);
            removeAlertMessage(pendingId);
            const transactionStatuses: TransactionStatus[] = postResAll.map((res) => res.data);
            const allSuccess = transactionStatuses.every((s) => s.status === TransactionType.COMMITTED);
            const failedStatuses = transactionStatuses.filter((s) => s.status !== TransactionType.COMMITTED);
            if (allSuccess) handleSuccess(transactionStatuses, geomContr);
            else handleError(failedStatuses, geomContr);
        } catch (error) {
            setIsLoading(false);
            if (error instanceof AxiosError) {
                addAlertMessage(StatusMessage.error, error.response?.data?.message || error.message);
            } else {
                addAlertMessage(StatusMessage.error, String(error));
            }
        }
    }, [contributions, user, lang, mapProj, verifyFeatData, addAlertMessage, removeAlertMessage, pendingMessage, handleSuccess, handleError]);

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
