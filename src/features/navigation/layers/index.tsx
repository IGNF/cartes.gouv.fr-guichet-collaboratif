import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import GetWMTSLayer from "./GetWMTSLayer";
import GetWMSLayer from "./GetWMSLayer";
import GetWFSLayer from "./GetWFSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import GetReportsLayer from "./GetReportsLayer";
import { useCallback } from "react";
import Button from "@codegouvfr/react-dsfr/Button";

const GetAllLayers = () => {
    const { communityLayers } = useCommunityStore();
    const { tableDrawerOpened, setTableDrawerOpened } = useReportStore();

    const displayTableReportsDrawer = useCallback(() => {
        setTableDrawerOpened(!tableDrawerOpened);
    }, [setTableDrawerOpened]);

    const { map } = useMapStore();
    if (!communityLayers || !map) return null;

    return (
        <>
            <GetReportsLayer />
            <Button
                iconId="fr-icon-discuss-line"
                className="btn-show-drawer fr-icon--sm"
                priority="tertiary"
                title="Afficher le tableau de signalement"
                onClick={displayTableReportsDrawer}
            />
            {communityLayers.map((layer: CommunityLayer, index: number) => {
                const geoservice = layer.geoservice;
                switch (geoservice.type) {
                    case "WMTS":
                        return <GetWMTSLayer key={`GetWMTS_${index}`} layer={layer} />;
                    case "WMS":
                        return <GetWMSLayer key={`GetWMS_${index}`} layer={layer} />;

                    case "WFS":
                        return <GetWFSLayer key={`GetWFS_${index}`} layer={layer} />;

                    default:
                        return;
                }
            })}
        </>
    );
};

export default GetAllLayers;
