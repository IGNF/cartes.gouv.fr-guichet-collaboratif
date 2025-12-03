import { useCallback, useEffect, useMemo, useState } from "react";
import ButtonControl from "./ButtonControl";
import { CommunityLayerRoleType, CustomControlItem, InteractionType } from "@/constants/communities/types";
import { useCommunityStore, useContributionStore, useMapStore } from "@/store";
import { Modify, Select, Draw, Snap } from "ol/interaction";
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
import { addFeatureProperties, addInteractionToMap, removeInteractionFromMap, setFeatNewCoords } from "@/constants/contributions/utils";
import CenterReportControl from "./CenterReportControl";

let isModifing = false;
let initialFeat: Feature | null = null;

const CustomControls = () => {
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
    const { map, mapWorkingLayer, clickedControl, setClickedControl } = useMapStore();
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

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const selectInteraction = useMemo(() => new Select({ condition: click, layers: [clickableLayer!], multi: true }), [clickableLayer]);
    const snapInteraction = useMemo(() => new Snap({ source: clickableSource, intersection: true }), [clickableSource]);

    const constrolsList = useCustomControlsList(t);

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
                initialFeature: initialFeat ?? feat?.clone(),
                layer: mapWorkingLayer,
                type,
            };

            let newContributions = [...contributions, newContr];

            if (contrExist) {
                newContr.initialFeature = contrExist.initialFeature;
                newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                if (contrExist.type === ContributionType.CREATE) {
                    if (type === ContributionType.DELETE) {
                        newContributions = [...contributions.filter((contr) => contr.feature !== newContr.feature)];
                    }
                    if (type === ContributionType.MODIFY) {
                        newContr.type = ContributionType.CREATE;
                        newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                    }
                }
                if (type === ContributionType.MODIFY) {
                    newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                }
            }
            setContributions(newContributions);
        },
        [contributions, mapWorkingLayer, setContributions]
    );

    const removeInteractionFunc = useCallback(
        (e: SelectEvent) => {
            selectInteraction.getFeatures().clear();
            const features = e.selected;
            const feat = features[0];
            if (currentMapWorkingSource) {
                currentMapWorkingSource?.removeFeature(feat);
                saveContributions(feat, ContributionType.DELETE);
            }
        },
        [currentMapWorkingSource, selectInteraction, saveContributions]
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
            const geoservice = currentCommunityLayer?.geoservice;
            const geometryNameColumn = geoservice?.columns.find((col) => col.name === geoservice.geometryName);
            if (currentMapWorkingSource) {
                addFeatureProperties(
                    feature,
                    currentCommunityLayer?.geoservice,
                    contributions.filter((contr) => contr.type === ContributionType.CREATE)
                );
                feature.set(FEATURE_TYPE_NEW_PROPERTY, true);
                if (geometryNameColumn?.is3d) setFeatNewCoords(feature);
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
                case InteractionType.SELECT:
                    interaction = selectInteraction;
                    interaction.on("select", selectInteractionFunc);
                    break;
                case InteractionType.REMOVE:
                    interaction = selectInteraction;
                    interaction.on("select", removeInteractionFunc);
                    break;
                case InteractionType.MODIFY:
                    interaction = new Modify({ features: selectInteraction?.getFeatures() });
                    interaction.on("modifyend", modifyInteractionFunc);
                    interaction.on("modifystart", modifyInteractionFuncStart);
                    break;
                case InteractionType.ADD_OBJECT:
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
        [
            clickableLayer,
            clickableSource,
            selectInteraction,
            selectInteractionFunc,
            removeInteractionFunc,
            modifyInteractionFunc,
            modifyInteractionFuncStart,
            drawInteractionFunc,
        ]
    );

    const handleClick = useCallback(
        (control: CustomControlItem) => {
            if (control.interaction === InteractionType.REMOVE) {
                selectInteraction.getFeatures().clear();
            }
            if (control.interaction !== InteractionType.MODIFY) {
                selectedFeatures.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
            }
            if (control === clickedControl) {
                setSelectedFeatures([]);
                removeInteractionFromMap(control.interaction, map!);
            } else {
                removeInteractionFromMap(clickedControl?.interaction ?? null, map!);
                const interaction = getInteractionByType(control.interaction, control.target);
                addInteractionToMap(interaction, map!);
            }
        },
        [map, clickedControl, selectedFeatures, selectInteraction, getInteractionByType]
    );

    useEffect(() => {
        if (!isModifing && clickedControl && clickedControl.interaction) {
            removeInteractionFromMap(clickedControl.interaction, map!);
            map?.removeInteraction(snapInteraction);
            const interaction = getInteractionByType(clickedControl.interaction, currentCommunityLayer?.geoservice.featureType ?? clickedControl.target);
            addInteractionToMap(interaction, map!);
            map?.addInteraction(snapInteraction);
        }
        return () => {
            if (!isModifing && clickedControl && clickedControl.interaction) {
                if (clickedControl?.interaction === InteractionType.REMOVE) selectInteraction.un("select", removeInteractionFunc);
                if (clickedControl?.interaction === InteractionType.SELECT) {
                    selectInteraction.un("select", selectInteractionFunc);
                }
            }
        };
    }, [
        clickedControl,
        map,
        mapWorkingLayer,
        currentCommunityLayer?.geoservice.featureType,
        selectInteraction,
        snapInteraction,
        getInteractionByType,
        removeInteractionFunc,
        selectInteractionFunc,
    ]);

    const clickToolButton = useCallback(() => {
        if (!clickedControl || clickedControl?.interaction || clickedControl?.disabled) return;
        const controlButton = document.querySelector(`button[id^='${clickedControl?.target}'`) as HTMLButtonElement;
        if (controlButton) {
            controlButton.click();
            if (controlButton.classList.contains("active")) {
                setClickedControl(null);
            }
        }
    }, [clickedControl, setClickedControl]);

    useEffect(() => {
        clickToolButton();
        return () => {
            clickToolButton();
        };
    }, [map, clickedControl, clickToolButton]);

    return (
        <div className="custom-controls">
            <div className="control-btns">
                {constrolsList.map((control) => {
                    if (control.interaction === InteractionType.MODIFY && currentCommunityLayer?.role === CommunityLayerRoleType.EDIT) {
                        if (!selectInteraction.getFeatures().getLength()) {
                            control.disabled = true;
                            control.title = t("please_select_object");
                        } else {
                            control.disabled = false;
                            control.title = t("cut_object");
                        }
                    }
                    return <ButtonControl key={`custom-control-${control.id}`} control={control} handleClick={handleClick} />;
                })}
            </div>
            <div className="all-reports-btn">
                <AllReportsControl />
            </div>
            <CenterReportControl />
        </div>
    );
};

export default CustomControls;
