import { CommunityReport, StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
import { useCommunityStore } from "@/store";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Map } from "ol";
import { useEffect, useState } from "react";

const showReportModal = createModal({
    id: "show-report-modal",
    isOpenedByDefault: false,
});

interface Props {
    map: Map | null;
}

const ShowReportModal: React.FC<Props> = ({ map }) => {
    const { reports } = useCommunityStore();
    const [selectedReport, setSelectedReport] = useState<CommunityReport | undefined>(undefined);

    useIsModalOpen(showReportModal, {
        onConceal: () => {
            setSelectedReport(undefined);
        },
    });

    useEffect(() => {
        map?.on("singleclick", function (evt) {
            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const report: CommunityReport = feature.get("reportData");
                const reportData = reports.find((r) => r.id === report.id);
                setSelectedReport(reportData);
                showReportModal.open();
            });
        });
        map?.on("pointermove", function (evt) {
            const features = map?.getFeaturesAtPixel(evt.pixel);
            const feature = features?.find((f) => f.get("reportData"));
            const targetElement = map?.getTargetElement();
            if (targetElement) {
                targetElement.style.cursor = feature ? "pointer" : "";
            }
        });
    }, [map, reports]);

    if (!ShowReportModal) return null;

    return (
        <showReportModal.Component
            title={"Information du signalement " + selectedReport?.id}
            iconId="fr-icon-checkbox-circle-line"
            buttons={[
                {
                    doClosesModal: false,
                    children: "Supprimer",
                    onClick: () => console.log("Supprimer " + selectedReport?.id),
                },
                {
                    children: "Annuler",
                },
                {
                    children: "Modifier",
                    onClick: () => console.log("Modifier " + selectedReport?.id),
                },
            ]}
        >
            <h6>Thèmes : {selectedReport?.themes.map((theme) => theme.theme).join(", ")}</h6>
            <h6>Commentaire : {selectedReport?.comment}</h6>
            <h6>
                Status : <img src={reportImgStatus[selectedReport?.status as StatusKey]} width={24} height={34} />
            </h6>
        </showReportModal.Component>
    );
};

export default ShowReportModal;
