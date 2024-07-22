import { Map } from "mapbox-gl";
import { earthHalfAxiosLength } from "./types";

export function getZoomByElevation(viewer: Map, elevation: number) {
    return Math.log2((2 * Math.PI * earthHalfAxiosLength) / (2 * elevation * Math.tan(viewer.transform._fov / 2)));
}

export function getElevationByZoom(viewer: Map, zoom: number) {
	return (2 * Math.PI * earthHalfAxiosLength) / Math.pow(2, zoom) / 2 / Math.tan(viewer.transform._fov / 2);
}