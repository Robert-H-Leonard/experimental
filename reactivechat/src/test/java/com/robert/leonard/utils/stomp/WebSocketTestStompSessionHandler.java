package com.robert.leonard.utils.stomp;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;

import java.lang.reflect.Type;
import java.util.function.Consumer;

@RequiredArgsConstructor
@Getter
@Setter
public class WebSocketTestStompSessionHandler extends StompSessionHandlerAdapter {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketTestStompSessionHandler.class);

    private Object payload;
    private StompHeaders headers;

    @Override
    public void afterConnected(StompSession session, StompHeaders headers) {
    }

    @Override
    /*
     * This is the method that is invoked when ever a web socket session receives a frame
     */
    public void handleFrame(StompHeaders headers, Object payload) {
        logger.info(String.format("Got payload: %s", payload));
        this.payload = payload;
        this.headers = headers;
    }

    @Override
    public Type getPayloadType(StompHeaders headers) {
        return JsonNode.class;
    }


    @Override
    public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
        logger.error(exception.getMessage());
        throw new RuntimeException("Failure in WebSocket handling", exception);
    }
}
