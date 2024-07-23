import { Viewer } from "cesium";
import { AnyContext, AnyMap, EventFrom, IEventHandler, SyncDirection, TriggerEvent, ViewUpdateEvent } from "./types";
import { Map } from "mapbox-gl";
import { MapboxEventHander } from "./MapboxEventHander";
import { CesiumEventHandler } from "./CesiumEventHandler";

type SyncOptions = {
    initFrom: EventFrom; 
    direction?: SyncDirection;
    mapboxAllowPitch?: boolean; 
    anyAllowPitch?: boolean 
}

export function mapViewSync(
    mapboxContext: AnyContext<Map>, 
    anyContext: AnyContext<AnyMap>, 
    options: SyncOptions
) {
    const syncContext = {
        eventFrom: options.initFrom || EventFrom.Mapbox,
        direction: options.direction || SyncDirection.Both
    }

    const trigger = (e: TriggerEvent) => {
        syncContext.eventFrom = e.eventFrom;
    }

    const getFrom = () => {
        return syncContext.eventFrom;
    }

    const onUpdateView = (e: ViewUpdateEvent) => {
        const { eventFrom } = e;
        if (syncContext.direction !== SyncDirection.AnyToMap && eventFrom === EventFrom.Mapbox) {
            anyEventHandler.updateView(e);
        } else if (syncContext.direction !== SyncDirection.MapToAny && eventFrom === EventFrom.Other) {
            mpboxEventHandler.updateView(e);
        }
    }

    const mpboxEventHandler: IEventHandler = new mapboxContext.Handler({
        map: mapboxContext.map,
        onTrigger: trigger,
        getFrom: getFrom,
        onUpdateView: onUpdateView
    });

    const anyEventHandler: IEventHandler = new anyContext.Handler({
        map: anyContext.map,
        onTrigger: trigger,
        getFrom: getFrom,
        onUpdateView: onUpdateView
    });

    if (syncContext.eventFrom === EventFrom.Mapbox) { 
        mpboxEventHandler.moveEnd();
    } else {
        anyEventHandler.moveEnd();
    }

    return {
        setSyncDirection: (direction: SyncDirection) => {
            syncContext.direction = direction;
        },
        destroy: () => {
            mpboxEventHandler.destroy();
            anyEventHandler.destroy();
        }
    }
}

export function mapboxViewSyncWithCesium(mpboxViewer: Map, cesiumViewer: Viewer, options: SyncOptions) {
    return mapViewSync(
        { map: mpboxViewer, Handler: MapboxEventHander }, 
        { map: cesiumViewer, Handler: CesiumEventHandler }, 
        options
    )
}