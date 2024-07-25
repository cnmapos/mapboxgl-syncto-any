import { Map } from "mapbox-gl";
import { earthHalfAxisLength } from "./types";

export function getZoomByElevation(viewer: Map, elevation: number) {
    return Math.log2((2 * Math.PI * earthHalfAxisLength) / (2 * elevation * Math.tan(viewer.transform._fov / 2)));
}

export function getElevationByZoom(viewer: Map, zoom: number) {
    const circumference = 2 * Math.PI * earthHalfAxisLength;
	return circumference / Math.pow(2, zoom) / 2 / Math.tan(viewer.transform._fov / 2);
}