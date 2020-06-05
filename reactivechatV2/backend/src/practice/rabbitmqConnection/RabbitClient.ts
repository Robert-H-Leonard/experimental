import { connect, Channel, Connection, ConsumeMessage } from "amqplib";
import * as _ from "lodash";
import { ChatroomRabbitData } from "../../repositories/chatRoomRepository";
import { User } from "../../repositories/userRepository";


export const LOCAL_URL  = 'amqp://root:root@localhost:5672';

/**
 * There should only be a single rabbit connection for pub and sub!
 * 
 * Max channels per connection is ~100 but is configurable
 */

/**
 * V0: Use direct exchange where the routing key is a hash of all the users in the room.
 *      The queue will be what all the users in the room subscribe to (1 to 1 routing key to queue)
 */
type RabbitExchangeType = 'direct' | 'fanout' | 'topic';

export class RabbitMqClient {

    private url: string

    constructor(url: string) {
        this.url = url;
    }


    initNewRoom = async (name: string): Promise<ChatroomRabbitData> => {
        const publisherConnection = await this.getNewRabbitConnection(this.url, '');
        const subscriberConnection = await this.getNewRabbitConnection(this.url, '');

        console.log("Rabbit connections established");

        const publisherDefaultChannel = await publisherConnection.createChannel();
        const subscriberDefaultChannel = await subscriberConnection.createChannel();

        console.log("Rabbit channels connected");


        const defaultExchange = await this.createExchange(name, "direct", publisherDefaultChannel);

        console.log("Rabbit exchange created");

        const queue = await publisherDefaultChannel.assertQueue(name);
        console.log("Rabbit queue created");

        return {
            publisherConnection,
            subscriberConnection,
            publisherDefaultChannel,
            subscriberDefaultChannel,
            defaultExchange
        }
    }

    getNewRabbitConnection = async (url: string, path: string) => await connect(`${url}${path}`);
    processMessage = async (message: ConsumeMessage) => console.log(message.content);
    createExchange = async (name: string, type: RabbitExchangeType, channel: Channel) => await channel.assertExchange(name, type, {durable: false});
}
