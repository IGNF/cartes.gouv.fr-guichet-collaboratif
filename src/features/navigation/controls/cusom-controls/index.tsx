import { useCallback, useEffect, useMemo, useState } from "react";
import ButtonControl from "./ButtonControl";
import { CustomControlItem } from "@/constants/communities/types";
import { useCommunityStore, useMapStore } from "@/store";
import { Modify, Select } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { SelectEvent } from "ol/interaction/Select";
import { Feature } from "ol";
import { click } from "ol/events/condition";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import AllReportsControl from "./AllReportsControl";

const CustomControls = () => {
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
    const { map, mapWorkingLayer, clickedControl } = useMapStore();

    const { community } = useCommunityStore();

    const constrolsList: CustomControlItem[] = useMemo(() => {
        return [
            {
                id: 0,
                title: "Sélecteur",
                target: "drawing-tool-point-",
                icon: "ri-cursor-line",
                disabled: false,
                interaction: "select",
            },
            {
                id: 1,
                title: "Soumettre un signalement",
                target: "drawing-tool-point-",
                icon: "ri-map-pin-add-line",
                disabled: false,
                interaction: null,
            },
            {
                id: 2,
                title: "Ajouter un objet",
                target: "drawing-tool-point-",
                icon: "ri-pen-nib-line",
                disabled: !community?.functionalities.includes("draw"),
                interaction: null,
            },
            {
                id: 3,
                title: "Couper un objet",
                target: "drawing-tool-edit-",
                icon: "ri-scissors-cut-line",
                disabled: !community?.functionalities.includes("modify"),
                interaction: "modify",
            },
            {
                id: 4,
                title: "Supprimer un objet",
                target: "drawing-tool-remove-",
                icon: "ri-delete-bin-line",
                disabled: !community?.functionalities.includes("delete"),
                interaction: "remove",
            },
            {
                id: 5,
                title: "Mesurer la distance",
                target: "GPshowMeasureLengthPicto-",
                icon: "ri-ruler-line",
                disabled: !community?.functionalities.includes("measureDistance"),
                interaction: null,
            },
        ];
    }, [community]);

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const selectInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const features = e.selected;
            features.forEach((feat) => {
                feat.set("selected", true);
            });
            selectedFeatures.forEach((feat) => {
                feat.unset("selected");
            });
            setSelectedFeatures(features);
        },
        [selectedFeatures]
    );

    const removeInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const features = e.selected;
            features.forEach((feat) => {
                const featLayer = map?.getAllLayers().find((l) => l.get("name") === feat?.get("geoservice")?.layer);
                if (featLayer) {
                    (featLayer.getSource() as VectorSource)?.removeFeature(feat);
                }
            });
        },
        [map]
    );

    const getInteractionByType = useCallback(
        (type: string | null): Select | Modify | null => {
            if (!clickableLayer || !clickableSource) return null;
            let interaction: Select | Modify;

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
                    break;
                default:
                    return null;
            }
            interaction.set("type", type);
            return interaction;
        },
        [clickableLayer, clickableSource, selectInteractionFunc, removeInteractionFunc]
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
        (type: string | null) => {
            const controlInteraction = getInteractionByType(type);
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
                    feat.unset("selected");
                });
                setSelectedFeatures([]);
                removeInteractionByType(control.interaction);
            } else {
                removeInteractionByType(clickedControl?.interaction ?? null);
                addInteractionByType(control.interaction);
            }
        },
        [clickedControl, selectedFeatures, addInteractionByType, removeInteractionByType]
    );

    useEffect(() => {
        if (clickedControl && clickedControl.interaction) {
            removeInteractionByType(clickedControl.interaction);
            addInteractionByType(clickedControl.interaction);
        }
    }, [clickedControl, map, addInteractionByType, removeInteractionByType]);

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
