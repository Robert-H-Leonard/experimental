import express from "express"
import http from 'http'
import socketio from 'socket.io'
import { createInMemoryUserRepository } from "./repositories"
import { RabbitMqClient, LOCAL_URL } from "./practice/rabbitmqConnection/RabbitClient"
import { SimpleChatroom } from "./chatroom"

const DEFAULT_NAMESPACE = '/general'
const userRepository = createInMemoryUserRepository();
const rabbitClient = new RabbitMqClient(LOCAL_URL);

const app = express();
const server = http.createServer(app);
const io = socketio(server)

// creates general chatroom namespace
const defaultNamespace = io.of(DEFAULT_NAMESPACE);


export const start = () => {
  server.listen(3000, () => console.log("Server started"));
  new SimpleChatroom(userRepository, rabbitClient, defaultNamespace, 'GENERAL')
  return app
}