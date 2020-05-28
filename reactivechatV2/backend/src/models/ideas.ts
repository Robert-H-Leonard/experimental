
type UUID = String;

interface JWT {
  "value": String;
}

/**
 * Open Questions:
 * 1) Does rabbitmq guarantee order of messages?
 */

/**
 * When a user sends a message the message will:
 * 1) Fire event to back-end through API (https, grpc, Websocket, etc), something like "event: { type: userMessage, eventData: {}, eventMetaData: {} ...}"
 * 2) Backend takes request and publishes event to rabbitmq
 * 3) Other users in chatroom will all be listening for messages in this channel (even the user who sent the message)
 * 4) IF rabbitmq ensures event order then it is all good
 */


interface Event {
  id: UUID,
  eventType: EventType,
  eventData: EventData,
  eventMetaData: EventMetaData
}

interface EventData {
  data: any
}

interface UserMessageEvent extends EventData {

}

interface EventMetaData {
  data: any
}

type EventType = "userChatMessage"

interface LiveSession {
  id: UUID,  //Can be cached in Redis
  videoUsers: UUID[],
  voiceOnlyUsers: UUID[],
  createdAt: Date
}

///////////////////////////////////// MONGO DB SCHEMA Below//////////////////////////////////////////
// Date and UUID need to be changed to strings for more efficiency 
interface Session {
  id: UUID,
  token: JWT,
  active: boolean,
  expireAt: Date
}

interface UserEntity {
  id: UUID,
  username: String,
  createdAt: string,
  lastLogin: string,
  curSession: UUID, // foreign-key
  isLoggedIn: boolean,
  isTyping?: boolean,
  curChat: UUID // foreign-key
}