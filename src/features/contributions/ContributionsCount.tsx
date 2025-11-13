import { ContributionType } from "@/constants/contributions/types";
import { ComponentKey } from "@/i18n/types";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import VectorSource from "ol/source/Vector";
import { useState, useRef, useCallback, useMemo } from "react";
import ContributionsConfirmReset from "./ContributionsConfirmReset";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { contributions, isReviewContribution, setReviewContribution, setContributions } = useContributionStore();
    const { confirmResetContributionModal } = useModalStore();

    const contrToReview = useMemo(() => contributions.filter((contr) => contr.type !== ContributionType.DELETE), [contributions]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const onClickReset = useCallback(() => {
        contributions.forEach((contr) => {
            const featLayerSource = map
                ?.getAllLayers()
                .find((l) => l.get("name") === contr.layer)
                ?.getSource() as VectorSource;

            contr.feature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            contr.initialFeature?.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            setReviewContribution(false);
            setWorkingLayerDrawerOpened(false);
            setClickedMapFeature(null);

            if (featLayerSource) {
                switch (contr.type) {
                    case ContributionType.CREATE:
                        if (featLayerSource.hasFeature(contr.feature)) featLayerSource.removeFeature(contr.feature);
                        break;
                    case ContributionType.MODIFY:
                        if (featLayerSource.hasFeature(contr.feature)) featLayerSource.removeFeature(contr.feature);
                        if (!featLayerSource.hasFeature(contr.initialFeature)) featLayerSource.addFeature(contr.initialFeature);
                        break;
                    case ContributionType.DELETE:
                        if (!featLayerSource.hasFeature(contr.initialFeature)) featLayerSource.addFeature(contr.initialFeature);
                        break;
                }
            }
        });
        setContributions([]);
        setIsDropdownOpen(false);
    }, [map, contributions, setContributions, setReviewContribution, setClickedMapFeature, setWorkingLayerDrawerOpened]);

    return (
        <div ref={buttonGroupRef} className="map-toolbar-button-group">
            <Button
                iconId="fr-icon-save-fill"
                priority="primary"
                title={t("save_contributions", { contributionCount: null })}
                onClick={() => {
                    const event = new CustomEvent("save-view-button");
                    document.dispatchEvent(event);
                }}
                className="map-toolbar-button-primary"
            >
                {t("save_contributions", { contributionCount: contributions?.length })}
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
                            disabled={!contrToReview.length}
                        >
                            {t("review")}
                        </Button>
                    </div>
                    <div className="map-toolbar-reset">
                        <Button
                            iconId="ri-refresh-line"
                            priority="secondary"
                            nativeButtonProps={confirmResetContributionModal.buttonProps}
                            disabled={!contributions.length}
                        >
                            {t("reset")}
                        </Button>
                    </div>
                </div>
            )}
            <ContributionsConfirmReset onConfirm={onClickReset} />
        </div>
    );
};

export default ContributionsCount;
