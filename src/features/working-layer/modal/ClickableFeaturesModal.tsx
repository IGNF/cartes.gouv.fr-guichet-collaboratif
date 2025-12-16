import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useContributionStore, useMapStore } from "@/store";
import { useCallback, useEffect, useMemo } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { Feature } from "ol";
import { useTranslation } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { InteractionType } from "@/constants/communities/types";

const modal = createModal({
    id: "clickable-features-modal",
    isOpenedByDefault: false,
});

const ClickableFeaturesModal = () => {
    const { clickableFeatures, clickedMapFeature, clickedControl, mapWorkingLayer, setClickedMapFeature, setClickableFeatures } = useMapStore();
    const { selectedObjects, setSelectedObjects } = useContributionStore();
    const isOpen = useIsModalOpen(modal, {
        onConceal: () => {
            setClickableFeatures([]);
        },
    });

    const { t } = useTranslation({ ClickableFeaturesModal });

    const geoserviceData = useMemo(() => clickableFeatures[0]?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY), [clickableFeatures]);

    useEffect(() => {
        if (clickableFeatures.length > 1) {
            modal.open();
            const closeButtons = document.querySelectorAll(`button[aria-controls="${modal.id}"`);
            closeButtons.forEach((button) => {
                button.textContent = t("close");
                button.setAttribute("title", t("close"));
            });
        } else if (isOpen) {
            modal.close();
        }
    }, [clickableFeatures, isOpen, t]);

    const handleSelectedFeature = useCallback(
        (f: Feature) => {
            if (clickedControl?.interaction !== InteractionType.SELECT) {
                setClickedMapFeature(f);
                return;
            }
            const isMultiSelectedFeature = selectedObjects.find(
                (feat) => feat.get(FEATURE_TYPE_DATA_PROPERTY)[`${geoserviceData?.idName}`] === f.get(FEATURE_TYPE_DATA_PROPERTY)[`${geoserviceData?.idName}`]
            );
            if (isMultiSelectedFeature) {
                isMultiSelectedFeature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                isMultiSelectedFeature.changed();
                setSelectedObjects(selectedObjects.filter((feat) => feat !== isMultiSelectedFeature));
            } else {
                f.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
                f.changed();
                setSelectedObjects([...selectedObjects, f]);
            }
        },
        [selectedObjects, clickedControl?.interaction, geoserviceData?.idName, setSelectedObjects, setClickedMapFeature]
    );

    const getButtonPriority = useCallback(
        (f: Feature): "secondary" | "tertiary" => {
            const data = f.get(FEATURE_TYPE_DATA_PROPERTY);
            const clickedMapData = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);

            if (!clickedMapFeature || !data) return "tertiary";

            if (clickedControl?.interaction === InteractionType.SELECT) {
                const isMultiSelectedFeature = selectedObjects.find(
                    (feat) => feat.get(FEATURE_TYPE_DATA_PROPERTY)[`${geoserviceData?.idName}`] === data[`${geoserviceData?.idName}`]
                );
                return isMultiSelectedFeature ? "secondary" : "tertiary";
            }

            if (data[`${geoserviceData?.idName}`]) {
                return clickedMapData[`${geoserviceData?.idName}`] === data[`${geoserviceData?.idName}`] ? "secondary" : "tertiary";
            }
            return "tertiary";
        },
        [clickedMapFeature, geoserviceData, clickedControl?.interaction, selectedObjects]
    );

    return (
        <modal.Component
            className="clickable-features-modal"
            iconId="fr-icon-info-line"
            title={
                <>
                    {" "}
                    {t("title")}
                    <p className="clickable-features-modal_sub-title">{geoserviceData?.title ?? mapWorkingLayer}</p>
                </>
            }
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
        >
            <div className="clickable-features-modal_content">
                {clickableFeatures.map((f, index) => (
                    <Button key={`clickable-features-modal_${index}`} onClick={() => handleSelectedFeature(f)} priority={getButtonPriority(f)}>
                        {f.get(FEATURE_TYPE_DATA_PROPERTY)[`${geoserviceData?.idName}`]}
                    </Button>
                ))}
            </div>
        </modal.Component>
    );
};

export default ClickableFeaturesModal;
