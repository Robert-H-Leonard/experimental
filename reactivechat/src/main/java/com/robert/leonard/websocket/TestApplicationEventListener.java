package com.robert.leonard.websocket;

import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.LinkedList;
import java.util.Queue;

@Component
@Getter
@Setter
public class TestApplicationEventListener {

    private static final Logger logger = LoggerFactory.getLogger(TestApplicationEventListener.class);

    private boolean testSubscribeCalled = false;
    private Queue<StompHeaderAccessor> subscribers = new LinkedList<>();

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
         logger.info("Subscribed to web socket!");
         subscribers.add(StompHeaderAccessor.wrap(event.getMessage()));
        this.testSubscribeCalled = true;
    }
}
