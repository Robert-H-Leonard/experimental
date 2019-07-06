package com.robert.leonard;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.Transport;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ExtendWith(SpringExtension.class)
public class WebSocketBrokerIntegrationtest {

    @LocalServerPort
    private int port;
    private String uri = "ws://localhost:";

    private WebSocketStompClient webSocketStompClient;
    private StompSession stompSession;
    List<Transport> transports = new ArrayList<>(1);

    private MappingJackson2MessageConverter mappingJackson2MessageConverter = new MappingJackson2MessageConverter();

    @BeforeEach
    public void setup() throws Exception{
        webSocketStompClient = new WebSocketStompClient(new StandardWebSocketClient());
        webSocketStompClient.setMessageConverter(mappingJackson2MessageConverter);
        webSocketStompClient.connect(uri + this.port + "/websocket", new StompSessionHandlerAdapter() {})
                .addCallback(successResult -> stompSession = successResult, failResult -> stompSession = null);

        Thread.sleep(1000);
    }

    @Test
    public void testShouldSuccessfullyConnectToServer() {
        assertTrue(stompSession.isConnected());
    }
}
