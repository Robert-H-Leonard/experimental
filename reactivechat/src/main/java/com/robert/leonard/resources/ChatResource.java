package com.robert.leonard.resources;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.robert.leonard.websocket.TestApplicationEventListener;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Collection;

import static com.robert.leonard.constants.WebSocketEndPoints.CHAT_JOIN_APP_PATH;
import static com.robert.leonard.constants.WebSocketEndPoints.CHAT_PARTICIPANTS_TOPICS_PATH;

@Controller
@RequiredArgsConstructor
public class ChatResource {


    private final TestApplicationEventListener eventListener;
    private final ObjectMapper objectMapper;

    @MessageMapping(CHAT_JOIN_APP_PATH)
    @SendTo(CHAT_PARTICIPANTS_TOPICS_PATH)
    public JsonNode greeting(@Payload String message, StompHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message);
        return objectMapper.valueToTree(eventListener.getSubscribers());
    }

    @MessageExceptionHandler
    @SendToUser
    public void exceptionHandle() {
    }
}
