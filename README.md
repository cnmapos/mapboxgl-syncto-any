# mapboxgl-syncto-any

mapboxgl-syncto-any是一款开源的地图视图同步工具，基于mapbox-gl，提供和其他任意地图视图同步，支持zoom、center、pitch、bearing等视图参数，默认提供mapbox-gl和cesium的全视角同步。

## DOCUMENTTATION
### mapViewSync(mapboxContext, anyContext, options)
- mapboxContext: { map, Handler }, map为mapbox-gl地图实体，Handler为实现IEventHandler和EventHandlerConstructor的类型
- anyContext: { map, Handler }, map地图实体，Handler为实现IEventHandler和EventHandlerConstructor的类型
- options: 
    - initFrom: 初始化同步源 `0为mapbox地图，1为其他地图`
    - direction: 视图同步方向 `0为双向同步，1为mapbox->other，2为other->mapbox`
    - mapboxAllowPitch: mapbox支持俯仰角同步
    - anyAllowPitch: 其他地图支持俯仰角同步
    
### mapboxViewSyncWithCesium(mpboxViewer, cesiumViewer, options)
- mpboxViewer: mapbox-gl地图实例
- cesiumViewer: Cesium.Viewer实例
- options: 和mapViewSync方法一致

## Example
示例代码在examples目录下，可执行命令运行示例:
```
cd examples
npm install
npm run dev
```
### mapboxViewSyncWithCesium示例
```
const mapboxMap = await mapboxSetup({ container: mboxMapEle.value });
const anyMap = await anyMapSetup({ container: anyMapEle.value });

const synchronizer = mapboxViewSyncWithCesium(mapboxMap, anyMap, { initFrom: 'mapbox', direction: 0 })

// synchronizer.setDirection(SyncDirection.Both) 设置同步方向，默认为双向同步。SyncDirection枚举包含:Both双向、MapToAnymapbox-gl同步至其他地图、AnyToMapbox其他地图同步至mapbox-gl

/ synchronizer.destroy() 销毁同步器
```
### mapViewSync示例
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
如果要实现其他地图与mapbox-gl的同步，只需要实现IEventHandler接口，例如cesium的同步Hander:
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
