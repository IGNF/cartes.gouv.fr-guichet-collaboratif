import { ContributionType } from "@/constants/contributions/types";
import { ComponentKey } from "@/i18n/types";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import VectorSource from "ol/source/Vector";
import { useState, useRef, useCallback, useMemo } from "react";
import ContributionsConfirmReset from "./ContributionsConfirmReset";

interface Props {
    t: TranslationFunction<"MapToolbar", ComponentKey>;
}

const ContributionsCount: React.FC<Props> = ({ t }) => {
    const { map } = useMapStore();
    const { contributions, isReviewContribution, toggleReviewContribution, setContributions } = useContributionStore();
    const { confirmCancelModal } = useModalStore();

    const contrToReview = useMemo(() => contributions.filter((contr) => contr.type !== ContributionType.DELETE), [contributions]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const buttonGroupRef = useRef<HTMLDivElement>(null);

    const onClickReview = useCallback(() => {
        toggleReviewContribution();
    }, [toggleReviewContribution]);

    const onClickReset = useCallback(() => {
        contributions.forEach((contr) => {
            const featLayerSource = map
                ?.getAllLayers()
                .find((l) => l.get("name") === contr.layer)
                ?.getSource() as VectorSource;

            if (featLayerSource) {
                switch (contr.type) {
                    case ContributionType.CREATE:
                        featLayerSource.removeFeature(contr.feature);
                        break;
                    case ContributionType.MODIFY:
                        featLayerSource.removeFeature(contr.feature);
                        featLayerSource.addFeature(contr.initialFeature);
                        break;
                    case ContributionType.DELETE:
                        featLayerSource.addFeature(contr.feature);
                        break;
                }
            }
        });
        setContributions([]);
        setIsDropdownOpen(false);
    }, [map, contributions, setContributions]);

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
                            onClick={onClickReview}
                            disabled={!contrToReview.length}
                        >
                            {t("review")}
                        </Button>
                    </div>
                    <div className="map-toolbar-reset">
                        <Button
                            iconId="ri-refresh-line"
                            priority="secondary"
                            nativeButtonProps={confirmCancelModal.buttonProps}
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
