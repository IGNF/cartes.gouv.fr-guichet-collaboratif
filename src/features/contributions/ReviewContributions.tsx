import { useContributionStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import type { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useCallback, useEffect, useMemo } from "react";
import { handleCenterToFeature } from "@/constants/utils";
import { useTranslation } from "@/i18n";

interface ContributionButtonProps {
    icon: FrIconClassName | RiIconClassName;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

const ContributionButton: React.FC<ContributionButtonProps> = ({ icon, title, onClick, disabled }) => (
    <Button iconId={icon} size="small" priority="tertiary no outline" title={title} onClick={onClick} disabled={disabled} />
);

const ReviewContributions = () => {
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { contributions } = useContributionStore();

    const { t } = useTranslation({ ReviewContributions });

    const contrToReview = useMemo(() => contributions, [contributions]);
    const total = contrToReview.length;
    const hasContributions = total > 0;

    const setCurrentContribution = useCallback(
        (position: number) => {
            if (contrToReview.length === 0) return;

            const pos = position > contrToReview.length - 1 ? 0 : position < 0 ? contrToReview.length - 1 : position;

            setClickedMapFeature(contrToReview[pos].feature);
        },
        [contrToReview, setClickedMapFeature]
    );

    const currentIndex = useMemo(() => {
        if (!hasContributions) return 0;

        if (clickedMapFeature) {
            const i = contrToReview.findIndex((c) => c.feature === clickedMapFeature);
            if (i !== -1) return i;
        }
        return total - 1;
    }, [clickedMapFeature, contrToReview, hasContributions, total]);

    useEffect(() => {
        if (!hasContributions) return;

        const feature = contrToReview[currentIndex]?.feature;
        if (feature) handleCenterToFeature(map, feature);
    }, [currentIndex, contrToReview, map, hasContributions]);

    const displayedPosition = hasContributions ? currentIndex + 1 : 0;

    return (
        <div className="review-contributions">
            <ContributionButton
                icon="ri-arrow-left-line"
                title={t("previous")}
                onClick={() => setCurrentContribution(currentIndex - 1)}
                disabled={!hasContributions}
            />
            <span>
                Contribution {displayedPosition} / {total}
            </span>
            <ContributionButton
                icon="ri-arrow-right-line"
                title={t("next")}
                onClick={() => setCurrentContribution(currentIndex + 1)}
                disabled={!hasContributions}
            />
        </div>
    );
};

export default ReviewContributions;
