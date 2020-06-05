import { Channel, Connection, ConsumeMessage, Replies,  } from "amqplib";
import { User, UserRepository } from "../userRepository";
import { Socket, Namespace } from "socket.io"
import { RabbitMqClient } from "../../practice/rabbitmqConnection/RabbitClient";
import moment from "moment";

export const chatroomTypes = ['general']


type UUID = string;
export type EventType = "sendMessage" | "login" | "joinedRoom" | "exitedRoom" | "typing" | "newRoomConnection"

export interface EventData {
    data: any
}

interface NewRoomConnectionEventData extends EventData {
    data: {
        username: string
    }
}

interface Event {
    eventType: EventType,
    eventData: EventData,
    eventMetadata?: any,
    createdAt: string
}

export interface ChatroomRabbitData{
    publisherConnection: Connection;
    subscriberConnection: Connection;
    publisherDefaultChannel: Channel;
    subscriberDefaultChannel: Channel;
    defaultExchange: Replies.AssertExchange;
}

export interface Message {
    username: string;
    event: Event;
    createdAt: moment.Moment;
}


/**
 * Process for creating a new chatroom
 * 1) Create new socketio namespace
 * 2) Create new exchange with the same name as the namespace
 * 3) Bind exchange to queue
 * 4) Expose publishChannel and subChannel
 * 5) Setup socket events
 */

 /**
  * User join chatroom flow
  * 1) Get user info from repository
  * 2) Add user to room
  */

export interface ChatRoom {
    name: string; // Namespace of socket
    id: string; // Either general chatroom id or hash of all users in room
    getUsers: () => User[];
    processMessage: (message: ConsumeMessage) => Promise<void>;
}

export class SimpleChatroom implements ChatRoom {

    public name: string;
    public id: string;

    protected rabbitClient: RabbitMqClient;
    protected rabbitData: ChatroomRabbitData;
    protected userRepository: UserRepository;
    protected socketNamespace: Namespace;

    private users: User[]

    constructor (userRepository: UserRepository, rabbitClient: RabbitMqClient, namespace: Namespace, id: string) {
        this.userRepository = userRepository;
        this.rabbitClient = rabbitClient;
        this.name = namespace.name;
        this.id = id;
        this.users = [];
        this.init(namespace)
    }

    init = async (namespace: Namespace) => {
        try {
            console.log("Creating new room")
            this.rabbitData = await this.rabbitClient.initNewRoom(namespace.name);
            await this.rabbitData.publisherDefaultChannel.bindQueue(namespace.name, this.rabbitData.defaultExchange.exchange, '');
            await this.rabbitData.subscriberDefaultChannel.consume(namespace.name, message => this.processMessage(message));
            this.socketNamespace = namespace;

            this.initSocketEvents();

        } catch(err) {
            console.log(err)
        }

    }

    initSocketEvents = async () => {
        this.socketNamespace.on('connection', socket => {
            console.log("Client connecting")
            // creates random username for user and adds to repository

            socket.on("login", async (username: string) => {
                console.log(`Client: ${username} attempting to login`)
                await this.userRepository.addUser(username, this.socketNamespace.name, socket)
                console.log("New user created!")
            });

            socket.on("newRoomConnection", async (event: Event, sendUsers: Function) => {
                try {
                    const user = await this.userRepository.getUser(event.eventData.data.username)

                    if(user) {
                        this.users.push(user)
                        //Emit rabbit message that user joined room
                        const nextEvent: Event = {
                            eventType: 'joinedRoom',
                            eventData: event.eventData,
                            createdAt: moment().fromNow().toString()
                        }
                        // Callback so front end knows all users in room
                        sendUsers(this.users)
                        this.rabbitData.publisherDefaultChannel.publish(this.rabbitData.defaultExchange.exchange, '', Buffer.from(JSON.stringify(nextEvent), 'utf-8'))
                    }
                } catch(err) {
                    console.log(err)
                }
            });

        });
    }


    processMessage = async (message: ConsumeMessage) => {
        const event = JSON.parse(message.content.toString('utf-8')) as Event;
        this.socketNamespace.emit(event.eventType, event)
    }

    getUsers = () => this.users
}