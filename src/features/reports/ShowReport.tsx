import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import AttachmentList from "./forms/AttachmentList";
import ThemeForm from "./forms/ThemeForm";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useCommunityStore, useReportStore } from "@/store";
import { getThemeAttributes } from "@/constants/utils";
import SketchList from "./forms/SketchList";
import EditReport from "./EditReport";

interface Props {
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { selectedReport, editReport, setEditReport } = useReportStore();
    const { community } = useCommunityStore();

    if (!community || !selectedReport) return;
    if (editReport) return <EditReport handleCloseDrawer={handleCloseDrawer} />;

    const selectedTheme = selectedReport.themes[0];
    const themeAttributes = getThemeAttributes(selectedTheme);
    const description = selectedReport.comment || "";
    const reportTheme = community.themes.find((theme) => theme.theme === selectedTheme.theme);

    return (
        <div className="report-drawer">
            <h1 className="fr-mt-4v fr-mb-1v fr-text--md">Signalement {selectedReport.id}</h1>

            <RadioButtons
                legend="Thème :"
                options={[
                    {
                        label: reportTheme?.theme,
                        nativeInputProps: {
                            checked: true,
                        },
                    },
                ]}
                state="default"
                stateRelatedMessage=""
                orientation="vertical"
                small
                disabled={true}
                className="theme-radio fr-mt-4v fr-mb-1v fr-text--md"
            />

            {selectedTheme && <ThemeForm theme={selectedTheme} themeAttributes={themeAttributes} />}

            <Accordion label="Liste des croquis :" defaultExpanded={true}>
                <SketchList />
            </Accordion>
            {description && (
                <Accordion label="Description :" defaultExpanded={true}>
                    <p>{description}</p>
                </Accordion>
            )}

            <Accordion label="Liste des documents :" defaultExpanded={true}>
                <div
                    style={{
                        width: "100%",
                    }}
                >
                    <AttachmentList />
                </div>
            </Accordion>

            <div className="buttons">
                <Button onClick={() => setEditReport(true)}>Modifier</Button>
            </div>
        </div>
    );
};

export default ShowReport;
