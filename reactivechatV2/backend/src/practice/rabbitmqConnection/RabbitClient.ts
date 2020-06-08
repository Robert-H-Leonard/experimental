import { connect, Channel, Connection, ConsumeMessage } from "amqplib";
import * as _ from "lodash";
import { ChatroomRabbitData } from "../../chatroom";
import { User } from "../../repositories/userRepository";


export const LOCAL_URL  = 'amqp://root:root@localhost:5672';

/**
 * There should only be a different rabbit connection for pub and sub!
 * 
 * Max channels per connection is ~100 but is configurable
 */

type RabbitExchangeType = 'direct' | 'fanout' | 'topic';

export class RabbitMqClient {

    private url: string

    constructor(url: string) {
        this.url = url;
    }


    /**
     * 1) Creates a new publisher connection and subscriber connection to rabbit.
     * 2) Creates a publisher channel and subscriber channel for rabbit.
     * 3) Creates a direct exchange for the channel that shares the usually has the same name as the socketio namespace.
     * 4) Creates a single queue for all messages for this room.
     * 
     * Questions:
     *  - Do I need to open new connections for each room? V1
     */
    setupRoomMessaging = async (name: string, messageProcessor: (message: ConsumeMessage) => Promise<void>): Promise<ChatroomRabbitData> => {
        const publisherConnection = await this.getNewRabbitConnection(this.url, '');
        const subscriberConnection = await this.getNewRabbitConnection(this.url, '');

        console.log(`Rabbit connections established for room ${name}`);

        const publisherDefaultChannel = await publisherConnection.createChannel();
        const subscriberDefaultChannel = await subscriberConnection.createChannel();

        console.log(`Rabbit channels connected for room ${name}`);


        const defaultExchange = await this.createExchange(name, "direct", publisherDefaultChannel);

        console.log(`Rabbit exchange created for room ${name}`);

        await publisherDefaultChannel.assertQueue(name);
        console.log(`Rabbit queue created for room ${name}`);

        publisherDefaultChannel.bindQueue(name, defaultExchange.exchange, '');
        console.log(`Publisher channel binded to queue for room ${name}`)

        subscriberDefaultChannel.consume(name, messageProcessor);
        console.log(`Subscriber channel message processor binded for room ${name}`)

        return {
            publisherConnection,
            subscriberConnection,
            publisherDefaultChannel,
            subscriberDefaultChannel,
            defaultExchange
        }
    }

    private getNewRabbitConnection = async (url: string, path: string) => await connect(`${url}${path}`);
    private createExchange = async (name: string, type: RabbitExchangeType, channel: Channel) => await channel.assertExchange(name, type, {durable: false});
}
