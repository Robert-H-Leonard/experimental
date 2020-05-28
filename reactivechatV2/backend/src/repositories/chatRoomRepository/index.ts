import { Channel, Connection, ConsumeMessage } from "amqplib";
import { User } from "../userRepository";
import { Socket } from "socket.io"

export const chatroomTypes = ['general']


type UUID = string;
export type EventType = "sendMessage" | "login" | "joinedRoom" | "exitedRoom" | "typing"

interface Event {
    id: UUID,
    eventType: EventType,
    eventData: any,
    eventMetadata: any,
    createdAt: string
}

export interface ChatroomRabbitData{
    publisherConnection: Connection;
    subscriberConnection: Connection;
    publisherDefaultChannel: Channel;
    subscriberDefaultChannel: Channel;
    publisherChannels: Channel[];
    subscriberChannels: Channel[];
}

export interface Message {
    user: User;
    data: string;
    createdAt: moment.Moment;
}

export interface ChatRoom {
    getUserNames: () => Promise<string[]>;
    processMessage: (message: ConsumeMessage) => Promise<void>;
    addUser: (username: string, socket: Socket) => Promise<void>;
    removeUser: (username:string) => Promise<void>;
    sendEventToUsers: (eventType: EventType, message: Message) => Promise<void>;
}