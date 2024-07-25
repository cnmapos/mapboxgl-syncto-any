# mapboxgl-syncto-any

mapboxgl-syncto-any is an open-source map view synchronization tool based on Mapbox GL JS. It provides synchronization capabilities with any other map views. By default, it offers full-view synchronization between Mapbox GL JS and CesiumJS.

## DOCUMENTTATION
### mapboxViewSyncWithCesium(mpboxViewer, cesiumViewer, options)
- mpboxViewer: mapbox-gl instance
- cesiumViewer: Cesium.Viewer instance
- options: Be identical to options of the mapViewSync method

### mapViewSync(mapboxContext, anyContext, options)
- mapboxContext: { map, Handler }, map represents the mapbox-gl map instance, and Handler is the type that implements both IEventHandler and EventHandlerConstructor interfaces.
- anyContext: { map, Handler } map represents the other map instance
- options: 
    - initFrom: The initial source for synchronization, `0:mapbox，1: others`
    - direction: The direction of view synchronization 
        - 0 for bidirectional synchronization
        - 1 for Mapbox -> other
        - 2 for other -> Mapbox.
    - mapboxAllowPitch: true|false, Indicates whether pitch updating is supported by the Mapbox map.
    - anyAllowPitch: true|false, Indicates whether pitch updating is supported by the other map.
    
## Example
Example code can be found in the examples directory. To run the example, execute the following commands:
```
cd examples
npm install
npm run dev
```
### mapboxViewSyncWithCesium demo
```
const mapboxMap = await mapboxSetup({ container: mboxMapEle.value });
const anyMap = await anyMapSetup({ container: anyMapEle.value });

const synchronizer = mapboxViewSyncWithCesium(mapboxMap, anyMap, { initFrom: 'mapbox', direction: 0 })

// synchronizer.setDirection(SyncDirection.Both); Change the synchronization direction dynamically. By default, it's bidirectional. Enum SyncDirection includes: Both, MapToAny, AnyToMapbox.
  
// synchronizer.destroy(); Destroy the synchronizer  
```
### mapViewSync demo
```
const mapboxMap = await mapboxSetup({ container: mboxMapEle.value });
const anyMap = await anyMapSetup({ container: anyMapEle.value });

const synchronizer = mapViewSync({ 
    map: mapboxMap,
    Handler: MapboxEventHander,
    }, {
    map: anyMap,
    Handler: CesiumEventHandler
    }, {
    initFrom: 'mapbox',
    direction: SyncDirection.MapToAny
    })
```

## Code
IEventHandler:
```
export interface IEventHandler {
    moveStart: (e?: any) => void;
    moveEnd: (e?: any) => void;
    updateView(e: ViewUpdateEvent): void;   
    destroy(): void;
}
```
EventHandlerConstructor:
```
export interface EventHandlerConstructor<T> {
    new (params: EventHandlerParams<T>): IEventHandler;
};
```
To achieve synchronization between other maps and mapbox-gl, all you need to do is implement the IEventHandler interface, similar to creating a synchronization handler for Cesium. Here's a conceptual example of how you might approach this:
```
export class CesiumEventHandler<T extends AnyMap> implements IEventHandler {
    private viewer: Viewer;
    private onTrigger: (e: TriggerEvent) => void;
    private onUpdateView: (e: ViewUpdateEvent) => void;
    private getFrom: () => EventFrom;

    constructor(params: EventHandlerParams<Viewer>) {
        this.viewer = params.map;
        this.viewer.scene.screenSpaceCameraController.tiltEventTypes = [CameraEventType.RIGHT_DRAG];
	    this.viewer.scene.screenSpaceCameraController.zoomEventTypes = [CameraEventType.WHEEL];
        this.onTrigger = params.onTrigger;
        this.getFrom = params.getFrom;
        this.onUpdateView = params.onUpdateView;
        this.viewer.canvas.addEventListener('mousemove', (this.moveEnd = this.moveEnd.bind(this)));
        const handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.moveStart = this.moveStart.bind(this);
        handler.setInputAction(this.moveStart, ScreenSpaceEventType.LEFT_DOWN);
        handler.setInputAction(this.moveStart, ScreenSpaceEventType.MIDDLE_DOWN);
        // this.viewer.scene.camera.moveEnd.addEventListener((this.moveEnd = this.moveEnd.bind(this)));
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

    moveStart(e: any) {
        this.onTrigger({ eventFrom: EventFrom.Other });
		this.viewer.camera.lookAtTransform(Matrix4.IDENTITY);
    }

    moveEnd(e: any) {
        if (this.getFrom() !== EventFrom.Other) {
            return;
        }
        // const { z } = this.viewer.camera.position;
        const bearing = (this.viewer.camera.heading / Math.PI) * 180;
        const pitch = (this.viewer.camera.pitch / Math.PI) * 180 + 90;
        // const center = getCenter(this.viewer);
        const center = new Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
        let z: number = 0;
        const centerWC = this.viewer.scene.camera.pickEllipsoid(center);
        if(defined(centerWC)) {
            z = Cartesian3.distance(centerWC, this.viewer.scene.camera.positionWC);
        }
        const mapCenter = getCenter(this.viewer);

        this.onUpdateView({
            eventFrom: this.getFrom(),
            center: mapCenter,
            elevation: z,
            bearing,
            pitch
        });
    }
}
```
