import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMapStore } from "@/store";
import { useEffect } from "react";
import "./clickableFeaturesModal.css";
import Button from "@codegouvfr/react-dsfr/Button";
import { Feature } from "ol";

const modal = createModal({
    id: "clickable-features-modal",
    isOpenedByDefault: false,
});

const ClickableFeaturesModal = () => {
    const { clickableFeatures, clickedMapFeature, mapWorkingLayer, setClickedMapFeature, setClickableFeatures } = useMapStore();
    const isOpen = useIsModalOpen(modal, {
        onConceal: () => {
            setClickableFeatures([]);
        },
    });

    useEffect(() => {
        if (clickableFeatures.length > 1) {
            modal.open();
        } else if (isOpen) {
            modal.close();
        }
    }, [clickableFeatures, isOpen]);

    const handleSelectedFeature = (f: Feature) => {
        setClickedMapFeature(f);
    };

    const getButtonPriority = (f: Feature): "secondary" | "tertiary" => {
        const data = f.get("featureTypeData");
        if (!clickedMapFeature || !data) return "tertiary";

        if (data.id) {
            return clickedMapFeature?.get("featureTypeData")?.id === data?.id ? "secondary" : "tertiary";
        }
        return "tertiary";
    };

    return (
        <modal.Component
            className="clickable-features-modal"
            iconId="fr-icon-info-line"
            title={
                <>
                    {" "}
                    Veuillez choisir un objet
                    <p className="clickable-features-modal_sub-title">{clickableFeatures[0]?.get("geoservice")?.title ?? mapWorkingLayer}</p>
                </>
            }
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
            buttons={[
                {
                    children: "Fermer",
                    priority: "secondary",
                    size: "small",
                },
            ]}
        >
            <div className="clickable-features-modal_content">
                {clickableFeatures.map((f, index) => (
                    <Button key={`clickable-features-modal_${index}`} onClick={() => handleSelectedFeature(f)} priority={getButtonPriority(f)}>
                        {f.get("featureTypeData")?.id || f.get("featureTypeData")?.cleabs}
                    </Button>
                ))}
            </div>
        </modal.Component>
    );
};

export default ClickableFeaturesModal;
