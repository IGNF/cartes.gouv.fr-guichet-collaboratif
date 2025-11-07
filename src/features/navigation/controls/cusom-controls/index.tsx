import { useCallback, useEffect, useMemo, useState } from "react";
import ButtonControl from "./ButtonControl";
import { CustomControlItem } from "@/constants/communities/types";
import { useCommunityStore, useContributionStore, useMapStore } from "@/store";
import { Modify, Select, Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { SelectEvent } from "ol/interaction/Select";
import { Feature } from "ol";
import { click } from "ol/events/condition";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import AllReportsControl from "./AllReportsControl";
import { useTranslation } from "@/i18n";
import { Contribution, ContributionType } from "@/constants/contributions/types";
import { ModifyEvent } from "ol/interaction/Modify";
import { DrawEvent } from "ol/interaction/Draw";
import useCustomControlsList from "@/hooks/navigation/controls/useCustomControlsList";
import { FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { addFeatureProperties } from "@/constants/contributions/utils";

let isModifing = false;
let initialFeat: Feature | null = null;
const CustomControls = () => {
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
    const { map, mapWorkingLayer, clickedControl } = useMapStore();
    const { contributions, setContributions } = useContributionStore();

    const { communityLayers } = useCommunityStore();

    const { t } = useTranslation({ CustomControls });

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);
    const currentMapWorkingSource = useMemo(
        () =>
            map
                ?.getAllLayers()
                .find((l) => l.get("name") === mapWorkingLayer)
                ?.getSource() as VectorSource,
        [map, mapWorkingLayer]
    );
    const constrolsList = useCustomControlsList(t);

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const selectInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const features = e.selected;
            features.forEach((feat) => {
                feat.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
            });
            selectedFeatures.forEach((feat) => {
                feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            });
            setSelectedFeatures(features);
        },
        [selectedFeatures]
    );

    const saveContributions = useCallback(
        (feat: Feature, type: ContributionType) => {
            const contrExist = contributions.find((contr) => contr.feature === feat);

            const newContr: Contribution = {
                feature: feat,
                initialFeature: initialFeat ?? feat.clone(),
                layer: mapWorkingLayer,
                type,
            };

            let newContributions = [...contributions, newContr];

            if (contrExist) {
                newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                if (contrExist.type === ContributionType.CREATE) {
                    if (type === ContributionType.DELETE) {
                        newContributions = [...contributions.filter((contr) => contr.feature !== newContr.feature)];
                    }
                    if (type === ContributionType.MODIFY) {
                        newContr.type = ContributionType.CREATE;
                        newContr.initialFeature = contrExist.initialFeature;
                        newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                    }
                }
                if (type === ContributionType.MODIFY) {
                    newContr.initialFeature = contrExist.initialFeature;
                    newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                }
            }
            setContributions(newContributions);
        },
        [contributions, mapWorkingLayer, setContributions]
    );

    const removeInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const features = e.selected;
            const feat = features[0];
            if (currentMapWorkingSource) {
                currentMapWorkingSource?.removeFeature(feat);
                saveContributions(feat, ContributionType.DELETE);
            }
        },
        [currentMapWorkingSource, saveContributions]
    );

    const modifyInteractionFunc = useCallback(
        (e: ModifyEvent) => {
            isModifing = false;
            const features = e.features.getArray();
            const feat = features[0];
            saveContributions(feat, ContributionType.MODIFY);
            initialFeat = null;
        },
        [saveContributions]
    );

    const modifyInteractionFuncStart = useCallback(
        (e: ModifyEvent) => {
            isModifing = true;
            const features = e.features.getArray();
            const feat = features[0];
            initialFeat = feat.clone();
            saveContributions(feat, ContributionType.MODIFY);
        },
        [saveContributions]
    );

    const drawInteractionFunc = useCallback(
        (e: DrawEvent) => {
            const feature = e.feature;
            if (currentMapWorkingSource) {
                addFeatureProperties(feature, currentCommunityLayer?.geoservice, contributions);
                feature.set(FEATURE_TYPE_NEW_PROPERTY, true);
                currentMapWorkingSource.addFeature(feature);
                saveContributions(feature, ContributionType.CREATE);
            }
        },
        [currentMapWorkingSource, currentCommunityLayer?.geoservice, contributions, saveContributions]
    );

    const getInteractionByType = useCallback(
        (type: string | null, target: string): Select | Modify | Draw | null => {
            if (!clickableLayer || !clickableSource) return null;
            let interaction: Select | Modify | Draw;

            switch (type) {
                case "select":
                    interaction = new Select({ condition: click, layers: [clickableLayer] });
                    interaction.on("select", selectInteractionFunc);
                    break;
                case "remove":
                    interaction = new Select({ condition: click, layers: [clickableLayer] });
                    interaction?.on("select", removeInteractionFunc);
                    break;
                case "modify":
                    interaction = new Modify({ source: clickableSource });
                    interaction.on("modifyend", modifyInteractionFunc);
                    interaction.on("modifystart", modifyInteractionFuncStart);
                    break;
                case "add":
                    interaction = new Draw({ type: "Point" });
                    if (target === "line") interaction = new Draw({ type: "LineString" });
                    if (target === "polygon") interaction = new Draw({ type: "Polygon" });
                    interaction.on("drawend", drawInteractionFunc);
                    break;
                default:
                    return null;
            }
            interaction.set("type", type);
            return interaction;
        },
        [clickableLayer, clickableSource, selectInteractionFunc, removeInteractionFunc, modifyInteractionFunc, modifyInteractionFuncStart, drawInteractionFunc]
    );

    const removeInteractionByType = useCallback(
        (type: string | null) => {
            if (!type) return;
            const controlInteraction = map
                ?.getInteractions()
                .getArray()
                .find((inter) => inter.get("type") === type);
            if (controlInteraction) {
                map?.removeInteraction(controlInteraction);
                return;
            }
        },
        [map]
    );

    const addInteractionByType = useCallback(
        (type: string | null, target: string) => {
            const controlInteraction = getInteractionByType(type, target);
            if (controlInteraction) {
                map?.addInteraction(controlInteraction);
                return;
            }
        },
        [map, getInteractionByType]
    );

    const handleClick = useCallback(
        (control: CustomControlItem) => {
            if (control === clickedControl) {
                selectedFeatures.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
                setSelectedFeatures([]);
                removeInteractionByType(control.interaction);
            } else {
                removeInteractionByType(clickedControl?.interaction ?? null);
                addInteractionByType(control.interaction, control.target);
            }
        },
        [clickedControl, selectedFeatures, addInteractionByType, removeInteractionByType]
    );

    useEffect(() => {
        if (!isModifing && clickedControl && clickedControl.interaction) {
            removeInteractionByType(clickedControl.interaction);
            addInteractionByType(clickedControl.interaction, currentCommunityLayer?.geoservice.featureType ?? clickedControl.target);
        }
    }, [clickedControl, map, mapWorkingLayer, currentCommunityLayer?.geoservice.featureType, addInteractionByType, removeInteractionByType]);

    return (
        <div className="custom-controls">
            <div>
                {constrolsList.map((control) => (
                    <ButtonControl key={`custom-control-${control.id}`} control={control} handleClick={handleClick} />
                ))}
            </div>
            <AllReportsControl />
        </div>
    );
};

export default CustomControls;
