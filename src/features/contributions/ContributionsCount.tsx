import { Contribution, ContributionType } from "@/constants/contributions/types";
import { ComponentKey } from "@/i18n/types";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore, useUserStore } from "@/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useState, useRef, useCallback, useMemo } from "react";
import ContributionsConfirmReset from "./ContributionsConfirmReset";
import ContributionList from "./ContributionList";
import { resetContributionToMap } from "@/constants/contributions/utils";
import ConfirmSaveContributions from "./ConfirmSaveContributions";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { useLang } from "@/i18n";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { postTransactions } from "@/api/transactionData";
import { AxiosError, AxiosResponse } from "axios";
import LoaderComponent from "@/components/LoaderComponent";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl } = useMapStore();
    const { contributions, isReviewContribution, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();
    const { confirmSaveContributionModal } = useModalStore();
    const { user } = useUserStore();
    const { addAlertMessage } = useCommunityStore();

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
        setClickedControl(null);
        setContributions(contributions.filter((c) => !contrToCancel.includes(c)));
        setContrToCancel([]);
        setIsDropdownOpen(false);
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

    const mapProj = useMemo(() => map?.getView()?.getProjection().getCode(), [map]);

    const verifyFeatData = useCallback((featData: { [key: string]: string | number | boolean | null }, geoservice: CommunityGeoservice) => {
        geoservice.columns.forEach((col) => {
            if (col.enum && featData[col.name]) {
                if (!col.enum.includes(featData[col.name] as string)) featData[col.name] = col.default_value;
            }
        });
    }, []);

    const handleSaveSuccess = useCallback(
        (postResAll: AxiosResponse[] | AxiosResponse, geomContr: { contr: Contribution; geom: string }[]) => {
            if (Array.isArray(postResAll)) {
                const resActions = postResAll.map((res) => res.data.actions).flat();

                if (resActions.length === geomContr.length) {
                    resActions.forEach((action) => {
                        const contr = geomContr.find((gc) => gc.geom === action.data.geom)?.contr;
                        const feat = contr?.feature;
                        if (feat) feat.set(FEATURE_TYPE_DATA_PROPERTY, action.data);
                    });
                    setContributions([]);

                    addAlertMessage(StatusMessage.success, t("save_contribution_success"));
                } else {
                    const notPostedContrs = geomContr
                        .filter((gc) =>
                            resActions.some((action) => {
                                const feat = gc.contr.feature;
                                const geoservice: CommunityGeoservice = feat.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
                                return gc.geom === action.data[`${geoservice.geometryName}`];
                            })
                        )
                        .map((gc) => gc.contr);

                    setContributions(notPostedContrs);
                    addAlertMessage(StatusMessage.error, t("save_contribution_error", { notPostedContrs }));
                }
                setWorkingLayerDrawerOpened(false);
                setClickedMapFeature(null);
                setClickedControl(null);
            } else {
                console.error(postResAll);
            }
        },
        [setContributions, addAlertMessage, setWorkingLayerDrawerOpened, setClickedMapFeature, setClickedControl, t]
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
            setIsLoading(false);
            handleSaveSuccess(postResAll, geomContr);
        } catch (error) {
            setIsLoading(false);
            if (error instanceof AxiosError) {
                addAlertMessage(StatusMessage.error, error.response?.data?.message);
            } else {
                console.error(error);
            }
        }
    }, [contributions, user, lang, mapProj, verifyFeatData, addAlertMessage, handleSaveSuccess]);

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
