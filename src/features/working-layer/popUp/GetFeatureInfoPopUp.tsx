import { useMapStore } from "@/store";
import { useEffect, useRef } from "react";
import Overlay from "ol/Overlay";

const isEmpty = (htmlString: string): boolean => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const bodyText = doc.body.textContent?.trim() || "";
    return bodyText.length > 0;
};

const removeStyle = (htmlString: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    doc.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
    return doc.body.innerHTML;
};

const GetFeatureInfoPopup = () => {
    const { map, featureInfo, setFeatureInfo } = useMapStore();
    const popupRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<Overlay | null>(null);

    useEffect(() => {
        if (!map || !popupRef.current) return;

        if (!overlayRef.current) {
            overlayRef.current = new Overlay({
                element: popupRef.current,
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
                positioning: "bottom-center",
                offset: [0, -10],
            });
            map.addOverlay(overlayRef.current);
        }

        return () => {
            if (overlayRef.current) {
                map.removeOverlay(overlayRef.current);
                overlayRef.current = null;
            }
        };
    }, [map]);

    useEffect(() => {
        if (!overlayRef.current) return;

        if (featureInfo.content && featureInfo.position && isEmpty(featureInfo.content)) {
            overlayRef.current.setPosition(featureInfo.position);
            overlayRef.current.getElement()?.classList.add("visible");
        } else {
            overlayRef.current.getElement()?.classList.remove("visible");
            overlayRef.current.setPosition(undefined);
        }
    }, [featureInfo.content, featureInfo.position]);

    const handleClose = () => {
        setFeatureInfo(null, null);
    };

    return (
        <div ref={popupRef} className="ol-popup get-feature-info-popup">
            <button className="ol-popup-closer" onClick={handleClose} aria-label="Close">
                ×
            </button>
            {featureInfo.content && <div dangerouslySetInnerHTML={{ __html: removeStyle(featureInfo.content) }} />}
        </div>
    );
};

export default GetFeatureInfoPopup;
