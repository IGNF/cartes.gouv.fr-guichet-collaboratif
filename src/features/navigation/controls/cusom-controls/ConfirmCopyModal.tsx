import ModaleComponent from "@/components/ModaleComponent";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice } from "@/constants/communities/types";
import { ContributionType } from "@/constants/contributions/types";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import { useCallback } from "react";

const ConfirmCopyModal: React.FC = () => {
    const { confirmCopyModal } = useModalStore();
    const { clickedMapFeature, mapWorkingLayer, map, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, saveContribution } = useContributionStore();

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const onConfirm = useCallback(() => {
        const clonedFeature = clickedMapFeature?.clone();
        if (clonedFeature) {
            const featureTypeData = clonedFeature.get(FEATURE_TYPE_DATA_PROPERTY);
            const geoservice: CommunityGeoservice = clonedFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
            clonedFeature.set(FEATURE_TYPE_DATA_PROPERTY, {
                ...featureTypeData,
                [`${geoservice?.idName}`]: contributions.filter((contr) => contr.type === ContributionType.CREATE)?.length + 1,
            });
            clickableSource?.addFeature(clonedFeature);
            setClickedMapFeature(clonedFeature);
            saveContribution(clonedFeature, ContributionType.CREATE, clickedMapFeature, mapWorkingLayer);
        }
        setClickedControl(null);
    }, [clickedMapFeature, clickableSource, mapWorkingLayer, contributions, setClickedControl, saveContribution, setClickedMapFeature]);

    const onCancel = useCallback(() => {
        setClickedControl(null);
    }, [setClickedControl]);

    return (
        <ModaleComponent modal={confirmCopyModal} title="Attention" onConfirm={onConfirm} onClose={onCancel} cancelText={"Non"} confirmText={"Oui"}>
            Voulez vous copier cet objet ?
        </ModaleComponent>
    );
};

export default ConfirmCopyModal;
