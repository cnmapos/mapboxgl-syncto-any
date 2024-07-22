import { AnyContext, AnyMap, EventFrom, IEventHandler, TriggerEvent, ViewUpdateEvent } from "./types";
import { Map } from "mapbox-gl";

export function mapSync(
    mapboxContext: AnyContext<Map>, 
    anyContext: AnyContext<AnyMap>, 
    options: { initFrom: EventFrom; mapboxAllowPitch?: boolean; anyAllowPitch?: boolean }
) {
    const syncContext = {
        eventFrom: options.initFrom || EventFrom.Mapbox,
    }

    const trigger = (e: TriggerEvent) => {
        syncContext.eventFrom = e.eventFrom;
    }

    const getFrom = () => {
        return syncContext.eventFrom;
    }

    const onUpdateView = (e: ViewUpdateEvent) => {
        const { eventFrom } = e;
        if (eventFrom === EventFrom.Mapbox) {
            anyEventHandler.updateView(e);
        } else if (eventFrom === EventFrom.Other) {
            mpboxEventHandler.updateView(e);
        }
    }

    const mpboxEventHandler: IEventHandler<Map> = new mapboxContext.Handler({
        map: mapboxContext.map,
        onTrigger: trigger,
        getFrom: getFrom,
        onUpdateView: onUpdateView
    });

    const anyEventHandler: IEventHandler<AnyMap> = new anyContext.Handler({
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
        destroy: () => {
            mpboxEventHandler.destroy();
            anyEventHandler.destroy();
        }
    }
}