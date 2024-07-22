export enum EventFrom {
    Mapbox = 'mapbox',
    Other = 'other'
}

export const earthHalfAxiosLength = 6378137.0;

export interface AnyMap {

}

export type ViewUpdateEvent = {
    eventFrom: EventFrom;
    center?: [number, number],
    zoom?: number,
    elevation?: number,
    pitch?: number, 
    bearing?: number
}

export type EventHandlerParams<T> = {
    map: T;
    onUpdateView: (e: ViewUpdateEvent) => void;
    onTrigger: (e: TriggerEvent) => void ;
    getFrom: () => EventFrom
}

export interface IEventHandler<T> {
    new (params: EventHandlerParams<T>): any;
    moveStart: (e?: any) => void;
    moveEnd: (e?: any) => void;
    updateView(e: ViewUpdateEvent): void;   
    destroy(): void;
}

export type TriggerEvent = {
    eventFrom: EventFrom;
}

export interface AnyContext<T> {
    map: T;
    Handler: IEventHandler<T>;

}