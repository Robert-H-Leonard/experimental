package com.robert.leonard.resources;

import com.fasterxml.jackson.databind.JsonNode;
import com.robert.leonard.events.ParticipantRepository;
import com.robert.leonard.events.models.UserSession;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatResource {

    private final ParticipantRepository participantRepository;

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/chatroom")
    public JsonNode addUser(@Payload JsonNode payload,
                          SimpMessageHeaderAccessor headerAccessor) {
        String username = payload.get("userName").asText();
        UserSession userSession = participantRepository.getSession(headerAccessor.getSessionId());
        userSession.setUsername(username);
        return payload;
    }


    @MessageExceptionHandler
    @SendToUser(value = "/queue/errors", broadcast = false)
    public String exceptionHandle(Throwable t) {
        return t.getMessage();
    }
}
