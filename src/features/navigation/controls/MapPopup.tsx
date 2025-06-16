import { useEffect, useRef } from "react";
import Overlay from "ol/Overlay";
import Map from "ol/Map";

type Props = {
    map: Map;
    content: string;
    coordinate: [number, number] | null;
    onClose: () => void;
};

export const MapPopup = ({ map, content, coordinate, onClose }: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<Overlay | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        overlayRef.current = new Overlay({
            element: containerRef.current,
            autoPan: true,
        });
        map.addOverlay(overlayRef.current);

        return () => {
            if (overlayRef.current) {
                map.removeOverlay(overlayRef.current);
            }
        };
    }, [map]);

    useEffect(() => {
        if (overlayRef.current && coordinate) {
            overlayRef.current.setPosition(coordinate);
        }
    }, [coordinate]);

    return (
        <div
            ref={containerRef}
            id="popup"
            style={{
                position: "absolute",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 1000,
                minWidth: "320px",
                maxWidth: "400px",
                overflow: "hidden",
            }}
        >
            <div
                id="popup-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderBottom: "1px solid #eee",
                }}
            >
                <div style={{ fontWeight: "bold", fontSize: 16, color: "#007BFF" }}>Information</div>
                <button
                    id="popup-close"
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: 20,
                        cursor: "pointer",
                    }}
                >
                    ✕
                </button>
            </div>
            <div id="popup-content" style={{ padding: 12 }} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};
