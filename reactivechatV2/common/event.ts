export type EventType = "sendMessage" | "login" | "joinedRoom" | "exitedRoom" | "typing" | "newRoomConnection"

export interface EventData {
    data: any
}

export interface NewRoomConnectionEventData extends EventData {
    data: {
        username: string
    }
}

export interface Event {
    eventType: EventType,
    eventData: EventData,
    eventMetadata?: any,
    createdAt: string,
    socketCallback?: Function
}

export interface NewRoomConnectionEvent extends Event {
    eventType: 'newRoomConnection',
    eventData: NewRoomConnectionEventData
}