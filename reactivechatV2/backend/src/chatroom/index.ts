import { Channel, Connection, ConsumeMessage, Replies,  } from "amqplib";
import { User, UserRepository } from "../repositories/userRepository";
import { Namespace } from "socket.io"
import { RabbitMqClient } from "../practice/rabbitmqConnection/RabbitClient";
import { NewRoomConnectionEvent, Event } from "../../../common/event"
import moment from "moment";

export const chatroomTypes = ['general']


type UUID = string;

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

export interface ChatRoom {
    name: string; // Namespace of socket
    id: string; // Either general chatroom id or hash of all users in room
    processMessage: (message: ConsumeMessage) => Promise<void>;
}


/**
 * Process for creating a new chatroom
 * 1) Create new socketio namespace
 * 2) Call rabbit client to setup rabbit connections for new room
 * 3) Setup socket events
 */

 /**
  * User join chatroom flow
  * 1) Get user info from repository
  * 2) Add user to room
  */


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
            this.rabbitData = await this.rabbitClient.setupRoomMessaging(namespace.name, this.processMessage);
            this.socketNamespace = namespace;
            this.initSocketEvents();
        } catch(err) {
            console.log(err)
        }

    }

    initSocketEvents = async () => {
        console.log(`Initializing socket events for room ${this.socketNamespace.name}`)
        this.socketNamespace.on('connection', socket => {
            console.log("Client connecting")

            socket.on("login", async (username: string) => {
                console.log(`Client: ${username} attempting to login`)
                await this.userRepository.addUser(username, this.socketNamespace.name, socket)
                console.log("New user created!")
            });
            socket.on("newRoomConnection", this.socketNewRoomConnectionEvent);
        });
    }

    // Take message from rabbit subscriber and emits it on socket namespace with appropriate event type
    processMessage = async (message: ConsumeMessage) => {
        const event = JSON.parse(message.content.toString('utf-8')) as Event;
        this.socketNamespace.emit(event.eventType, event)
    }

    private socketNewRoomConnectionEvent = async (event: NewRoomConnectionEvent, returnUsersInRoom: Function) => {
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
                this.rabbitData.publisherDefaultChannel.publish(this.rabbitData.defaultExchange.exchange, '', Buffer.from(JSON.stringify(nextEvent), 'utf-8'))
                // Callback so new user knows all users in room
                returnUsersInRoom(this.users.map(user => user.username))
            }
        } catch(err) {
            console.log(err)
        }
    }
}