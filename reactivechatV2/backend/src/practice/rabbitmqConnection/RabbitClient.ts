import { connect, Channel, Connection, ConsumeMessage } from "amqplib";
import * as _ from "lodash";
import { Message, ChatRoom, ChatroomRabbitData, EventType } from "../../repositories/chatRoomRepository";
import { UserRepository, User } from "../../repositories/userRepository";
import { Socket } from "socket.io"

const LOCAL_URL  = 'amqp://root:root@localhost:5672';
export const DEFAULT_QUEUE = 'general';


/////////////////////////////////
////////    Event types and interfaces 




//////////////////////////////////////

export const initGeneralChatRoom = async (): Promise<Chatroom> => {
    try {
        
        const publisherConnection = await getNewRabbitConnection(LOCAL_URL, '');
        const subscriberConnection = await getNewRabbitConnection(LOCAL_URL, '');

        const pubChannel = await publisherConnection.createChannel();
        const subChannel = await subscriberConnection.createChannel();

        const exchange = await createExchange(DEFAULT_QUEUE, "direct", pubChannel);
        await pubChannel.bindQueue(DEFAULT_QUEUE, exchange.exchange, '');
    } catch(err) {
        console.log(err);
    }
}
/**
 * V0: Use direct exchange where the routing key is a hash of all the users in the room.
 *      The queue will be what all the users in the room subscribe to (1 to 1 routing key to queue)
 */
type RabbitExhangeType = 'direct' | 'fanout' | 'topic';

export class RabbitMqClient {

    private url: string

    constructor(url: string) {
        this.url = url;
    }


    initNewRoom = async (): Promise<ChatroomRabbitData> => {
        const publisherConnection = await this.getNewRabbitConnection(this.url, '');
        const subscriberConnection = await this.getNewRabbitConnection(this.url, '');

        const publisherDefaultChannel = await publisherConnection.createChannel();
        const subscriberDefaultChannel = await subscriberConnection.createChannel();

        return {
            publisherConnection,
            subscriberConnection,
            publisherDefaultChannel,
            subscriberDefaultChannel,
            publisherChannels: [publisherDefaultChannel],
            subscriberChannels: [subscriberDefaultChannel]
        }
    }

    getNewRabbitConnection = async (url: string, path: string) => await connect(`${url}${path}`);
    processMessage = async (message: ConsumeMessage) => console.log(message.content);
    createExchange = async (name: string, type: RabbitExhangeType, channel: Channel) => await channel.assertExchange(name, type, {durable: false});
}


export class GeneralChatroom implements ChatRoom {

    protected rabbitClient: RabbitMqClient;
    protected rabbitData: ChatroomRabbitData;
    protected repository: UserRepository;

    protected name: string;
    protected routingKey: string;
    protected messages: Message[];

    DEFAULT_QUEUE = 'general';

    constructor (userRepository: UserRepository, rabbitClient: RabbitMqClient, name: string, routingKey: string) {
        this.repository = userRepository;
        this.rabbitClient = rabbitClient;

        this.name = name;
        this.routingKey = routingKey;
        this.messages = [];
    }

    init = async () => {
        try {
            this.rabbitData = await this.rabbitClient.initNewRoom();
            const exchange = await this.rabbitClient.createExchange(this.name, "direct", this.rabbitData.publisherDefaultChannel);
            await this.rabbitData.publisherDefaultChannel.bindQueue(DEFAULT_QUEUE, exchange.exchange, '');
            await this.rabbitData.subscriberDefaultChannel.consume(DEFAULT_QUEUE, message => this.processMessage(message))
        } catch(err) {
            console.log(err)
        }

    }

    // This is the method that will send events to users through their socket
    processMessage = async (message: ConsumeMessage) => await this.rabbitClient.processMessage(message);

    getUserNames = async () => this.repository.getUserNames()

    addUser = async (username: string, socket: Socket) => {
        this.repository.addUser(username);
    }

    removeUser = async (username: string) => {
        this.repository.removeUser(username);
    }

    sendEventToUsers = async (eventType: EventType, message: Message) => {}
    
}
