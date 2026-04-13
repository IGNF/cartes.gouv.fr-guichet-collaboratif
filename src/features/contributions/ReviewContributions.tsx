import { useContributionStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import type { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useCallback, useEffect, useState } from "react";
import { handleCenterToFeature } from "@/constants/utils";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { useTranslation } from "@/i18n";

interface ContributionButtonProps {
    icon: FrIconClassName | RiIconClassName;
    title: string;
    onClick: () => void;
}

const ContributionButton: React.FC<ContributionButtonProps> = ({ icon, title, onClick }) => (
    <Button iconId={icon} size="small" priority="tertiary no outline" title={title} onClick={onClick} />
);

const ReviewContributions = () => {
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { contributions } = useContributionStore();

    const { t } = useTranslation({ ReviewContributions });

    const contrToReview = contributions;

    const [currentPosition, setCurrentPosition] = useState(contrToReview.length - 1);

    const setCurrentContribution = useCallback(
        (position: number) => {
            if (position > contrToReview.length - 1) {
                position = 0;
            }
            if (position < 0) {
                position = contrToReview.length - 1;
            }
            const nextContribution = contrToReview[position];
            if (!nextContribution) return;
            setCurrentPosition(position);
            setClickedMapFeature(nextContribution.feature);
        },
        [setClickedMapFeature, contrToReview]
    );

    useEffect(() => {
        if (contrToReview.length === 0) return;

        if (currentPosition > contrToReview.length - 1) {
            setCurrentPosition(contrToReview.length - 1);
            return;
        }

        const clickedMapContribution = contrToReview.find((c) => c.feature === clickedMapFeature);
        const currentIndex = clickedMapContribution ? contrToReview.indexOf(clickedMapContribution) : -1;
        const safeIndex = currentIndex !== -1 ? currentIndex : currentPosition;
        const currentContribution = contrToReview[safeIndex];
        const feature = currentContribution?.feature;
        if (feature) {
            handleCenterToFeature(map, feature);
            if (currentIndex !== -1) setCurrentContribution(currentIndex);
        }
    }, [currentPosition, contrToReview, map, clickedMapFeature, setCurrentContribution]);

    const total = contrToReview.length;

    return (
        <div className="review-contributions">
            <Tooltip title={t("previous")}>
                <ContributionButton icon="ri-arrow-left-line" title="" onClick={() => setCurrentContribution(currentPosition - 1)} />
            </Tooltip>

            <span>
                Contribution {currentPosition + 1} / {total}
            </span>
            <Tooltip title={t("next")}>
                <ContributionButton icon="ri-arrow-right-line" title="" onClick={() => setCurrentContribution(currentPosition + 1)} />
            </Tooltip>
        </div>
    );
};

export default ReviewContributions;
