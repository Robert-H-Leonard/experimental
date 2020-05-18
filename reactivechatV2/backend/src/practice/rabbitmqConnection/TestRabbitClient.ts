import * as amqp from "amqplib"


export const startUp = async () => {
    try {
        const rabbitMqConnection = await getNewRabbitConnection();
        const rabbitConnectionTwo = await getNewRabbitConnection();
        
        const queueName = "testQueue";
        const message = "Hello RabbitMq";

        const channel = await rabbitMqConnection.createChannel()
        await sendMessagesToRabbitChannel(channel,queueName,message)

        const exchange = await createExchange(channel)
        await channel.bindQueue(queueName, exchange.exchange, '');
        
        setInterval(() => channel.publish(exchange.exchange, '', Buffer.from(message)), 2000)
        channel.consume(queueName, message => console.log(message.content.toString()))
    
    } catch(err) {
        console.log(err)
    }
}

const getNewRabbitConnection = async () => await amqp.connect('amqp://root:root@localhost:5672');

const createExchange = async (channel: amqp.Channel) => await channel.assertExchange('test', 'fanout', {durable: false});

const sendMessagesToRabbitChannel = async (channel: amqp.Channel ,queueName: string, message: string) => {
    try {
        await channel.assertQueue(queueName)
        setInterval(()=> channel.sendToQueue(queueName, Buffer.from(message)), 2000)
    } catch (err) {
        console.log(err)
    }
}

const pullMessageFromRabbitChannel = async (connection: amqp.Connection ,queueName: string) => {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName)

    const queueOptions = {
        noAck: false
    }
    channel.consume(queueName, message => {
        console.log(`Received Message ${message.content.toString()}`)
    }, queueOptions )
}

