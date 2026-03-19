import ModaleComponent from "@/components/ModaleComponent";
import { useMapStore, useModalStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import Select from "@codegouvfr/react-dsfr/Select";
import Input from "@codegouvfr/react-dsfr/Input";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import OlMap from "ol/Map";
import { ScaleLine } from "ol/control";
import { createPreviewMap, exportMap, MARGIN_OPTIONS, EXPORT_SIZE_OPTIONS, PAPER_RATIO, type PAGE_ORIENTATION, type EXPORT_FORMAT } from "./exportMapUtils";

const ExportMapModal: React.FC = () => {
    const { map, setClickedControl } = useMapStore();
    const { exportMapModal } = useModalStore();

    const [orientation, setOrientation] = useState<PAGE_ORIENTATION>("portrait");
    const [dimensions, setDimensions] = useState("A4");
    const [margin, setMargin] = useState(5);
    const [title, setTitle] = useState("Ma carte");
    const [hasTitle, setHasTitle] = useState(true);
    const [hasScale, setHasScale] = useState(true);
    const [format, setFormat] = useState<EXPORT_FORMAT>("PNG");

    const previewRef = useRef<HTMLDivElement>(null);
    const previewMapRef = useRef<OlMap | null>(null);
    const scaleControlRef = useRef<ScaleLine | null>(null);

    const destroyPreview = () => {
        previewMapRef.current?.setTarget(undefined);
        previewMapRef.current?.dispose();
        previewMapRef.current = null;
        scaleControlRef.current = null;
    };

    useIsModalOpen(exportMapModal, {
        onConceal: () => {
            setClickedControl(null);
            destroyPreview();
        },
        onDisclose: () =>
            setTimeout(() => {
                if (!map || !previewRef.current) return;
                destroyPreview();
                const { previewMap, scaleControl } = createPreviewMap(previewRef.current, map);
                previewMapRef.current = previewMap;
                scaleControlRef.current = scaleControl;
            }, 0),
    });

    useEffect(() => {
        const pm = previewMapRef.current,
            sc = scaleControlRef.current;
        if (!pm || !sc) return;
        if (hasScale) {
            if (!pm.getControls().getArray().includes(sc)) pm.addControl(sc);
        } else pm.removeControl(sc);
    }, [hasScale]);

    useEffect(() => {
        previewMapRef.current?.updateSize();
    }, [orientation, margin, hasTitle]);

    const paperAspect = orientation === "portrait" ? PAPER_RATIO : 1 / PAPER_RATIO;
    const marginPad = margin > 0 ? `${(margin * 0.12).toFixed(2)}rem` : "0";

    const handleConfirm = () => {
        if (!map || !previewMapRef.current) return;
        exportMap(map, {
            orientation,
            dimensions,
            margin,
            title,
            hasTitle,
            hasScale,
            format,
            previewMap: previewMapRef.current,
        });
    };

    return (
        <ModaleComponent
            modal={exportMapModal}
            title="Imprimer une carte"
            size="large"
            onConfirm={handleConfirm}
            confirmText="Imprimer la carte"
            className="fr-modal--export-map"
        >
            <div className="export-map-page">
                <div className="export-map-form">
                    <p className="export-map-section-label">Mise en Page</p>
                    <div className="export-map-orientation">
                        {(["portrait", "landscape"] as PAGE_ORIENTATION[]).map((o) => (
                            <button
                                key={o}
                                type="button"
                                className={`export-map-orientation-btn${orientation === o ? " active" : ""}`}
                                onClick={() => setOrientation(o)}
                            >
                                <span className={`orientation-icon ${o}-icon`} />
                                {o === "portrait" ? "Portrait" : "Paysage"}
                            </button>
                        ))}
                    </div>
                    <div className="export-map-divider" />
                    <Select label="Dimensions" nativeSelectProps={{ value: dimensions, onChange: (e) => setDimensions(e.target.value) }}>
                        {EXPORT_SIZE_OPTIONS.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </Select>
                    <Select label="Marge" nativeSelectProps={{ value: String(margin), onChange: (e) => setMargin(Number(e.target.value)) }}>
                        {MARGIN_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </Select>
                    <div className="export-map-divider" />
                    <Input label="Titre de la carte" disabled={!hasTitle} nativeInputProps={{ value: title, onChange: (e) => setTitle(e.target.value) }} />
                    <Checkbox
                        options={[
                            { label: "Désactiver le titre", nativeInputProps: { checked: !hasTitle, onChange: () => setHasTitle((v) => !v) } },
                            { label: "Désactiver l'échelle", nativeInputProps: { checked: !hasScale, onChange: () => setHasScale((v) => !v) } },
                        ]}
                    />
                    <div className="export-map-divider" />
                    <Select
                        label="Format d'export"
                        nativeSelectProps={{
                            value: format,
                            onChange: (e) => setFormat(e.target.value as EXPORT_FORMAT),
                        }}
                    >
                        {(["PNG", "JPEG", "PDF"] as EXPORT_FORMAT[]).map((f) => (
                            <option key={f}>{f}</option>
                        ))}
                    </Select>
                </div>
                <div className="export-map-preview-wrapper">
                    <div className="export-map-paper" style={{ aspectRatio: String(paperAspect) }}>
                        <div className="export-map-paper-inner" style={{ padding: marginPad }}>
                            {hasTitle && title.trim() && <div className="export-map-preview-title">{title}</div>}
                            <div className="export-map-preview-map" ref={previewRef} />
                        </div>
                    </div>
                </div>
            </div>
        </ModaleComponent>
    );
};

export default ExportMapModal;
