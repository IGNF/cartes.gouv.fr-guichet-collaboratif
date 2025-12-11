import { Contribution, ContributionType, TransactionStatus, TransactionAction, TransactionType } from "@/constants/contributions/types";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore, useUserStore } from "@/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState, useRef, useCallback, useMemo } from "react";
import ContributionsConfirmReset from "./ContributionsConfirmReset";
import ContributionList from "./ContributionList";
import { resetContributionToMap } from "@/constants/contributions/utils";
import ConfirmSaveContributions from "./ConfirmSaveContributions";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { useLang } from "@/i18n";
import { ComponentKey } from "@/i18n/types";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { pollTransactionStatus, postTransactions } from "@/api/transactionData";
import { AxiosError } from "axios";
import LoaderComponent from "@/components/LoaderComponent";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { contributions, isReviewContribution, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();
    const { confirmSaveContributionModal } = useModalStore();
    const { user } = useUserStore();
    const { addAlertMessage, removeAlertMessage } = useCommunityStore();

    const { lang } = useLang();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const onClickReset = useCallback(() => {
        contrToCancel.forEach((contr) => {
            resetContributionToMap(map!, contr);
        });
        setReviewContribution(false);
        setWorkingLayerDrawerOpened(false);
        setClickedMapFeature(null);
        setContributions(contributions.filter((c) => !contrToCancel.includes(c)));
        setContrToCancel([]);
        setIsDropdownOpen(false);
    }, [map, contrToCancel, contributions, setContributions, setReviewContribution, setClickedMapFeature, setWorkingLayerDrawerOpened, setContrToCancel]);

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
                    }
                });
            });

            setContributions([]);
            addAlertMessage(StatusMessage.success, t("success"));
        },
        [setContributions, addAlertMessage, t]
    );

    const handleError = useCallback(
        (failedStatuses: TransactionStatus[], geomContr: { contr: Contribution; geom: string }[]) => {
            const errorMessages = failedStatuses.map((status) => status.message || "Unknown error").join("; ");
            addAlertMessage(StatusMessage.error, t("error") + ": " + errorMessages);

            const failedGeoms = failedStatuses
                .flatMap((status) => status.actions.map((action: TransactionAction) => action.data))
                .map((data) => {
                    return Object.values(data).find(
                        (val) => typeof val === "string" && (val.startsWith("POINT") || val.startsWith("LINESTRING") || val.startsWith("POLYGON"))
                    );
                });

            const failedContributions = geomContr.filter((gc) => failedGeoms.includes(gc.geom)).map((gc) => gc.contr);
            setContributions(failedContributions);
        },
        [setContributions, addAlertMessage, t]
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

            if (geometryNameColumn?.is3d && featGeometry.includes(" Z")) {
                featGeometry = featGeometry.replace(" Z", ""); // " Z" car wkt l'ajoute pour les coordonnées 3D
            }

            const action = {
                table: geoservice.table,
                state: contr.type,
                data: { ...featData, [`${geoservice.geometryName}`]: featGeometry },
            };

            geomContr.push({
                contr,
                geom: featGeometry,
            });

            if (apiExist) {
                apiExist.body.actions.push(action);
            } else {
                apis.push({
                    database: geoservice.database,
                    body: {
                        comment: `Transaction ajoutée par l'utilisateur ${user?.name} ; date et heure : ${today.toLocaleDateString(lang, { formatMatcher: "best fit" })} ${today.toLocaleTimeString(lang)} (code : wfsTransactions)`,
                        actions: [action],
                    },
                });
            }
        });
        try {
            const postResAll = await postTransactions(apis);

            const transactionPromises = postResAll.map(async (res, index) => {
                const transactionId = res.data.id;
                const database = apis[index].database;
                return await pollTransactionStatus(database, transactionId);
            });
            const pendingId = addAlertMessage(StatusMessage.info, t("statut"));

            const transactionStatuses = await Promise.all(transactionPromises);

            removeAlertMessage(pendingId);

            setIsLoading(false);

            const allSuccess = transactionStatuses.every((status) => status.status === TransactionType.COMMITTED);
            const failedStatuses = transactionStatuses.filter((status) => status.status !== TransactionType.COMMITTED);

            if (allSuccess) {
                handleSuccess(transactionStatuses, geomContr);
            } else {
                handleError(failedStatuses, geomContr);
            }
        } catch (error) {
            setIsLoading(false);
            if (error instanceof AxiosError) {
                addAlertMessage(StatusMessage.error, error.response?.data?.message || error.message);
            } else {
                console.error(error);
                addAlertMessage(StatusMessage.error, String(error));
            }
        }
    }, [contributions, user, lang, mapProj, verifyFeatData, addAlertMessage, removeAlertMessage, t, handleSuccess, handleError]);
    return (
        <div ref={buttonGroupRef} className="map-toolbar-button-group">
            <Button
                iconId="fr-icon-save-fill"
                priority="primary"
                title={t("save_contributions", { contributionCount: null })}
                className="map-toolbar-button-primary"
                disabled={!contributions.length}
                nativeButtonProps={confirmSaveContributionModal.buttonProps}
            >
                {t("save_contributions", { contributionCount: contributions?.length })}
                {isLoading && <LoaderComponent />}
            </Button>

            <Button
                iconId={isDropdownOpen ? `fr-icon-arrow-up-s-line` : `fr-icon-arrow-down-s-line`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title={t("show_more")}
                className="map-toolbar-button-toggle"
            ></Button>

            {isDropdownOpen && (
                <div className="map-toolbar-dropdown" style={{ width: buttonGroupRef.current?.clientWidth ?? 40 }}>
                    <div className="map-toolbar-line">
                        {t("object_created", { count: contributions.filter((contr) => contr.type === ContributionType.CREATE).length })}
                    </div>
                    <div className="map-toolbar-line">
                        {t("object_modified", { count: contributions.filter((contr) => contr.type === ContributionType.MODIFY).length })}
                    </div>
                    <div className="map-toolbar-line">
                        {t("object_deleted", { count: contributions.filter((contr) => contr.type === ContributionType.DELETE).length })}
                    </div>
                    <div className="map-toolbar-review">
                        <Button
                            className="map-toolbar-review-link"
                            priority={isReviewContribution ? "secondary" : "tertiary"}
                            onClick={() => setReviewContribution(!isReviewContribution)}
                            disabled={!contributions.length}
                        >
                            {t("review")}
                        </Button>
                    </div>
                </div>
            )}
            <ContributionsConfirmReset onConfirm={onClickReset} />
            <ConfirmSaveContributions onConfirm={onSave} />
            <ContributionList />
        </div>
    );
};

export default ContributionsCount;
