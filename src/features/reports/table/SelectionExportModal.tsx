import { useState } from "react";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

import ModaleComponent from "@/components/ModaleComponent";
import { ReportExportFormat } from "@/constants/reports/utils/exportReports";
import { useTranslation } from "@/i18n";
import { useModalStore } from "@/store";

interface SelectionExportModalProps {
    onExport: (format: ReportExportFormat) => void;
}

export default function SelectionExportModal({ onExport }: SelectionExportModalProps) {
    const [format, setFormat] = useState<ReportExportFormat>("csv");
    const { selectionExportModal } = useModalStore();
    const { t } = useTranslation({ SelectionExportModal });

    return (
        <ModaleComponent
            modal={selectionExportModal}
            title={t("title")}
            onClose={() => setFormat("csv")}
            onConfirm={() => onExport(format)}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
        >
            <RadioButtons
                legend={t("format_legend")}
                name="report-export-format"
                options={[
                    {
                        label: t("csv"),
                        hintText: t("csv_hint"),
                        nativeInputProps: {
                            value: "csv",
                            checked: format === "csv",
                            onChange: () => setFormat("csv"),
                        },
                    },
                    {
                        label: t("geojson"),
                        hintText: t("geojson_hint"),
                        nativeInputProps: {
                            value: "geojson",
                            checked: format === "geojson",
                            onChange: () => setFormat("geojson"),
                        },
                    },
                ]}
            />
        </ModaleComponent>
    );
}
