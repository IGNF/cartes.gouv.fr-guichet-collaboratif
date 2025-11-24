import { ContributionType } from "@/constants/contributions/types";
import { ComponentKey } from "@/i18n/types";
import { useContributionStore, useMapStore } from "@/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useState, useRef, useCallback, useMemo } from "react";
import ContributionsConfirmReset from "./ContributionsConfirmReset";
import ContributionList from "./ContributionList";
import { resetContributionToMap } from "@/constants/contributions/utils";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const { map, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { contributions, isReviewContribution, contrToCancel, setReviewContribution, setContributions, setContrToCancel } = useContributionStore();

    const contrToReview = useMemo(() => contributions.filter((contr) => contr.type !== ContributionType.DELETE), [contributions]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                </div>
            )}
            <ContributionsConfirmReset onConfirm={onClickReset} />
            <ContributionList />
        </div>
    );
};

export default ContributionsCount;
