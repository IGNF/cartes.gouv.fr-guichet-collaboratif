import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";

export function computeWMTS(map: Map, coordinate: [number, number]) {
    const view = map.getView();
    const zoom = Math.floor(view.getZoom() ?? 0);

    const wmtsLayer = map
        .getLayers()
        .getArray()
        .find((layer) => layer instanceof TileLayer && layer.getSource() instanceof WMTS) as TileLayer<WMTS> | undefined;

    if (!wmtsLayer) {
        console.warn("Aucune couche WMTS trouvée sur la carte.");
        return null;
    }

    const source = wmtsLayer.getSource();

    if (!source) {
        console.warn("Source WMTS introuvable sur la couche.");
        return null;
    }

    const tileGrid = source.getTileGrid();

    if (!tileGrid) {
        console.warn("TileGrid manquant dans la source WMTS.");
        return null;
    }

    if (!tileGrid) {
        console.warn("TileGrid manquant dans la source WMTS.");
        return null;
    }

    const origin = tileGrid.getOrigin(zoom);
    const tileSizeRaw = tileGrid.getTileSize(zoom);
    const tileSize = Array.isArray(tileSizeRaw) ? tileSizeRaw[0] : tileSizeRaw;
    const resolution = tileGrid.getResolution(zoom);

    const originX = origin[0];
    const originY = origin[1];

    const tileCol = Math.floor((coordinate[0] - originX) / (tileSize * resolution));
    const tileRow = Math.floor((originY - coordinate[1]) / (tileSize * resolution));

    const tileOriginX = originX + tileCol * tileSize * resolution;
    const tileOriginY = originY - tileRow * tileSize * resolution;

    const pixelI = Math.floor((coordinate[0] - tileOriginX) / resolution);
    const pixelJ = Math.floor((tileOriginY - coordinate[1]) / resolution);

    return {
        tileMatrix: zoom.toString(),
        tileCol,
        tileRow,
        i: pixelI,
        j: pixelJ,
    };
}
