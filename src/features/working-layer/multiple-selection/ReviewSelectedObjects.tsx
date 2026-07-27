import Button from "@codegouvfr/react-dsfr/Button";
import type { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useCallback, useMemo } from "react";
import { useTranslation } from "@/i18n";
import { useContributionStore, useMapStore } from "@/store";
import { handleCenterToFeature } from "@/constants/utils";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";

import type { Map } from "ol";
import type { Feature } from "ol";

interface NavigationButtonProps {
    icon: FrIconClassName | RiIconClassName;
    title: string;
    onClick: () => void;
    disabled?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ icon, title, onClick, disabled }) => (
    <Button iconId={icon} size="small" priority="tertiary no outline" title={title} onClick={onClick} disabled={disabled} />
);

const panToFeature = (map: Map | null, feature: Feature) => {
    // Pan to the feature's geometry center
    const geometry = feature.getGeometry();
    if (!geometry) return;

    handleCenterToFeature(map, feature);
};

const highlightOnly = (all: Feature[], focused: Feature) => {
    // Highlight only the focused feature and unhighlight the others if user uses the nav bar
    all.forEach((f) => {
        if (f === focused) {
            f.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
        } else {
            f.unset(FEATURE_TYPE_SELECTED_PROPERTY);
        }
        f.changed();
    });
};

const ReviewSelectedObjects = () => {
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { selectedObjects, setSelectedObjects } = useContributionStore();

    const { t } = useTranslation({ ReviewSelectedObjects });

    const total = selectedObjects.length;
    const hasSelectedObjects = total > 0;

    const currentIndex = useMemo(() => {
        if (total === 0) return 0;

        if (clickedMapFeature) {
            const i = selectedObjects.findIndex((f) => f === clickedMapFeature);
            if (i !== -1) return i;
        }
        return 0;
    }, [clickedMapFeature, selectedObjects, total]);

    const navigateTo = useCallback(
        // Navigate to the next or previous feature in the selectedObjects array
        // Then update extent and highlight the other feature
        (position: number) => {
            if (total === 0) return;

            const pos = position > total - 1 ? 0 : position < 0 ? total - 1 : position;
            const feature = selectedObjects[pos];

            highlightOnly(selectedObjects, feature);
            setClickedMapFeature(feature);
            panToFeature(map, feature);
        },
        [selectedObjects, total, map, setClickedMapFeature]
    );

    const deselectCurrent = useCallback(() => {
        const feature = selectedObjects[currentIndex];
        if (!feature) return;

        feature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
        feature.changed();

        const remaining = selectedObjects.filter((f) => f !== feature);
        setSelectedObjects(remaining);

        // Index is zero based
        if (remaining.length > 0) {
            const nextIndex = currentIndex >= remaining.length ? remaining.length - 1 : currentIndex;
            setClickedMapFeature(remaining[nextIndex]);
        } else {
            setClickedMapFeature(null);
        }
    }, [selectedObjects, currentIndex, setSelectedObjects, setClickedMapFeature]);

    const displayedPosition = hasSelectedObjects ? currentIndex + 1 : 0;

    return (
        <div className="review-selected-objects review-navigation">
            <NavigationButton icon="ri-arrow-left-line" title={t("previous")} onClick={() => navigateTo(currentIndex - 1)} disabled={!hasSelectedObjects} />
            <span className="review-navigation__counter">
                {t("selection")} {displayedPosition} / {total}
            </span>
            <NavigationButton icon="ri-arrow-right-line" title={t("next")} onClick={() => navigateTo(currentIndex + 1)} disabled={!hasSelectedObjects} />
            <NavigationButton icon="ri-close-line" title={t("deselect")} onClick={deselectCurrent} disabled={!hasSelectedObjects} />
        </div>
    );
};

export default ReviewSelectedObjects;
