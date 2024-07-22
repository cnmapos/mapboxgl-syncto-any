import { EventFrom, EventHandlerParams, IEventHandler, TriggerEvent, ViewUpdateEvent } from "./types";
import _ from 'lodash';
import { Cartesian2, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer, Math as CMath, Cartesian3, HeadingPitchRange, Matrix4 } from 'cesium';

function getCenter(viewer: any): [number,number] {
    const windowPosition = new Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);
    const pickRay = viewer.scene.camera.getPickRay(windowPosition);
    const pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
    const pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
    const lng = pickPositionCartographic.longitude * (180 / Math.PI);
    const lat = pickPositionCartographic.latitude * (180 / Math.PI);
    const coor: [number, number] = [lng, lat];
    
    return coor;
}

export class CesiumEventHandler implements IEventHandler<Viewer> {
    private viewer: Viewer;
    private onTrigger: (e: TriggerEvent) => void;
    private onUpdateView: (e: ViewUpdateEvent) => void;
    private getFrom: () => EventFrom;

    constructor(params: EventHandlerParams<Viewer>) {
        this.viewer = params.map;
        this.onTrigger = params.onTrigger;
        this.getFrom = params.getFrom;
        const handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction((this.mouseDown = this.mouseDown.bind(this)), ScreenSpaceEventType.LEFT_DOWN);
        this.viewer.scene.camera.moveEnd.addEventListener((this.mouseMoveEnd = this.mouseMoveEnd.bind(this)));
    }

    updateView(e: ViewUpdateEvent): void {
        const { bearing, center, pitch, elevation  } = e;
        if (!center || !_.isNumber(bearing) || !_.isNumber(pitch)) {
            return;
        }
        const heading = CMath.toRadians(bearing);
		const lookTarget = Cartesian3.fromDegrees(...center);

		const cameraPitch = CMath.toRadians(pitch - 90 + 0.01); 
		const range = elevation / Math.sin(((90 - pitch) * Math.PI) / 180);
		
		
        this.viewer.camera.lookAt(
			lookTarget,
			new HeadingPitchRange(heading, cameraPitch, range * Math.sin(((90 - pitch) * Math.PI) / 180))
		);
    }
    destroy(): void {
    }

    private mouseDown(e: any) {
        this.onTrigger({ eventFrom: EventFrom.Other });
		this.viewer.camera.lookAtTransform(Matrix4.IDENTITY);
    }

    private mouseMoveEnd(e: any) {
        const { z } = this.viewer.camera.position;
        const bearing = (this.viewer.camera.heading / Math.PI) * 180;
        const pitch = (this.viewer.camera.pitch / Math.PI) * 180 + 90;
        const center = getCenter(this.viewer);

        this.onUpdateView({
            eventFrom: this.getFrom(),
            center,
            elevation: z,
            bearing,
            pitch
        });
    }
}