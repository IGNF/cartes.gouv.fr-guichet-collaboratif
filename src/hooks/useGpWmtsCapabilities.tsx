import { useQuery } from "@tanstack/react-query";
import WMTSCapabilities from "ol/format/WMTSCapabilities";

export default function useGpWmtsCapabilities() {
    return useQuery({
        queryKey: ["gp_wmts_getcap"],
        queryFn: async () => {
            const response = await fetch("https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities");
            if (!response.ok) {
                throw new Error(`Bad response from server : ${response.status}`);
            }
            const text = await response.text();

            const format = new WMTSCapabilities();
            const capabilities = format.read(text);
            if (!capabilities) {
                throw new Error("Reading capabilities failed");
            }

            return capabilities;
        },
        staleTime: Infinity,
    });
}
