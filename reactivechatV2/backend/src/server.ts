import express from "express"
import https from 'https'
import socketio from 'socket.io'
import { createInMemoryUserRepository } from "./repositories"
import { RabbitMqClient, LOCAL_URL } from "./practice/rabbitmqConnection/RabbitClient"
import { SimpleChatroom } from "./repositories/chatRoomRepository"

const DEFAULT_NAMESPACE = '/general'
const userRepository = createInMemoryUserRepository();
const rabbitClient = new RabbitMqClient(LOCAL_URL);

const app = express();
const http = https.createServer(app);
const io = socketio(http);

// creates general chatroom namespace
const defaultNamespace = io.of(DEFAULT_NAMESPACE);


export const start = () => {
  http.listen(3000, () => console.log("Server started"));
  new SimpleChatroom(userRepository, rabbitClient, defaultNamespace, 'GENERAL')
  return app
}