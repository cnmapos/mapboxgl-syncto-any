import { Map, MapMouseEvent } from "mapbox-gl";
import { EventFrom, EventHandlerParams, IEventHandler, TriggerEvent, ViewUpdateEvent } from "./types";
import _ from 'lodash';
import { getElevationByZoom, getZoomByElevation } from "./utils";

/***
 * Mapbox视图同步处理器
 */
export class MapboxEventHander<T extends Map> implements IEventHandler {
    private viewer: Map;
    private onTrigger: (e: TriggerEvent) => void;
    private onUpdateView: (e: ViewUpdateEvent) => void;
    private getFrom: () => EventFrom;


    constructor(params: EventHandlerParams<T>) {
        this.viewer = params.map;
        // onTrigger给外部通知，哪个地图源出发了视图更新
        this.onTrigger = params.onTrigger;
        this.getFrom = params.getFrom;
        this.onUpdateView = params.onUpdateView;
        this.viewer.on('mousedown', (this.moveStart = this.moveStart.bind(this)));
        this.viewer.on('move', (this.moveEnd = this.moveEnd.bind(this)));
    }

    moveStart(e: MapMouseEvent) {
        // 给外部通知mapbox触发了视图更新
        this.onTrigger({...e, eventFrom: EventFrom.Mapbox });
    }

    moveEnd() {
        if (this.getFrom() !== EventFrom.Mapbox) {
            return
        }
        // 获取当前地图视图的参数：pitch、zoom、center、elevation
        const pitch = this.viewer.getPitch();
        const { lng, lat } = this.viewer.getCenter();
        const zoom = this.viewer.getZoom();
        const elevation = getElevationByZoom(this.viewer, zoom);
        let bearing = this.viewer.getBearing();
        if (bearing < 0) {
            bearing = bearing + 360;
        }
        // 通知外部，由mapbox触发的视图更新结束
        this.onUpdateView({
            eventFrom: this.getFrom(),
            center: [lng, lat],
            zoom,
            elevation,
            pitch, 
            bearing
        });
    }

    // 外部调用，更新mapbox地图视图参数
    updateView(e: ViewUpdateEvent) {
        const { elevation, center, bearing, pitch } = e;
        if (_.isNumber(elevation)) {
            const zoom = getZoomByElevation(this.viewer, elevation);
            this.viewer.setZoom(zoom);
        }
        if (center) {
            this.viewer.setCenter(center);
        }
        if (_.isNumber(bearing)) {
            this.viewer.setBearing(bearing);
        }
        if (_.isNumber(pitch)) {
            this.viewer.setPitch(pitch);
        }
    }

    destroy() {
        this.viewer.off('mousedown', this.moveStart);
        this.viewer.off('move', this.moveEnd);
    }
}