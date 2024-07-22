import { Map as MapboxMap } from "mapbox-gl";

export function mapboxSetup(params: { container: HTMLElement }): Promise<MapboxMap> {
    const map = new MapboxMap({
        container: params.container,
        center: [104.061891, 30.65796],
        zoom: 13,
        style: 'mapbox://styles/mapbox/standard',
        accessToken: 'pk.eyJ1IjoiZmlyZWZseW1heSIsImEiOiJTWlFlSmxNIn0.dOnbpTcWRE2PauD9XwJA1Q'
    });

    return new Promise((resolve) => {
        map.on('load', () => {
            resolve(map);
        });
    });
}
