package com.robert.leonard.events;

import com.robert.leonard.events.models.UserSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;

@Component
@RequiredArgsConstructor
public class ChatEventListner {

    private static Logger logger = LoggerFactory.getLogger(ChatEventListner.class);

    private final MappingJackson2MessageConverter messageConverter;
    private final ParticipantRepository participantRepository;

    @EventListener
    public void sessionConnect(SessionConnectedEvent connectEvent) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(connectEvent.getMessage());

        UserSession userSession = new UserSession();
        userSession.setSessionId(headerAccessor.getSessionId());
        participantRepository.addSession(userSession);

        logger.info("UserConnected");
    }
}
