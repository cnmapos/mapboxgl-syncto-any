export enum EventFrom {
    Mapbox = 'mapbox',
    Other = 'other'
}

export const earthHalfAxisLength = 6378137.0;

export type AnyMap = any;

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

// 地图交互处理器
export interface IEventHandler {
    // 当启动移动时，以当前地图为触发源
    moveStart: (e?: any) => void;
    // 当停止移动时，触发视图参数更新
    moveEnd: (e?: any) => void;
    // 对外方法，e为接收到的视图参数，方法体实现地图视角更新
    updateView(e: ViewUpdateEvent): void;   
    destroy(): void;
}

export interface EventHandlerConstructor<T> {
    new (params: EventHandlerParams<T>): IEventHandler;
};

export type TriggerEvent = {
    eventFrom: EventFrom;
}

export interface AnyContext<T> {
    map: T;
    Handler: EventHandlerConstructor<T>
}

export enum SyncDirection {
    Both = 0,
    MapToAny = 1,
    AnyToMap = 2
}