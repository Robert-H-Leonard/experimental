package com.robert.leonard;

import com.robert.leonard.utils.stomp.TestStompClientFactory;
import com.robert.leonard.utils.stomp.TestStompClientImpl;
import com.robert.leonard.utils.stomp.WebSocketTestStompSessionHandler;
import com.robert.leonard.websocket.TestApplicationEventListener;
import lombok.Getter;
import lombok.Setter;
import org.assertj.core.internal.bytebuddy.utility.RandomString;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ExtendWith(SpringExtension.class)
public class WebSocketBrokerIntegrationtest {

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private TestApplicationEventListener eventListener;

    @Autowired
    TestApplicationEventListener testApplicationEventListener;
    private final TestStompClientFactory stompClientFactory = new TestStompClientFactory();

    @LocalServerPort
    private int port;
    private String uri = "ws://localhost:";
    private String basePath = "/websocket";

    private TestStompClientImpl testStompClient;
    private List<TestStompClientImpl> testStompClients;


    @BeforeEach
    public void setup() throws Exception{
        testStompClient = stompClientFactory.getStompClient();
        testStompClient.connectToStompWebSocketServer(uri + port + basePath);

        testStompClients = IntStream.range(0, 2)
                .boxed()
                .map(i -> {
                    TestStompClientImpl client =stompClientFactory.getStompClient();
                    client.connectToStompWebSocketServer(uri + port + basePath);
                    return  client;
                })
                .collect(Collectors.toList());
        Thread.sleep(500);
    }

    /*
      //TODO
      1) Allow a user to subscribe to the channel.
      2) Allow user to send message to the channel.
      3)Allow toggle on chat history or not.
     */

    @Test
    public void testShouldSuccessfullyConnectToServer() {
        assertTrue(testStompClient.getStompSession().isConnected());
    }

    @Test
    public void testShouldSuccessfullySubscribeToTopicAndReceiveMessage() throws Exception{
        String message = "Robert";
        StompSession stompSession = testStompClient.getStompSession();

        stompSession.setAutoReceipt(true);

        WebSocketTestStompSessionHandler testStompSessionHandler =  new WebSocketTestStompSessionHandler();
        stompSession.subscribe("/topic/chat/participants", testStompSessionHandler);

        Thread.sleep(50);
       assertTrue(testApplicationEventListener.isTestSubscribeCalled());

        stompSession.send("/app/chat/join", message);
        Thread.sleep(100);

        assertEquals(message,eventListener.getSubscribers().remove().getSessionAttributes().get("username"));
    }

    @Test
    public void testShouldSuccessfullyHaveMultipleSubscribers() throws Exception {

        List<WebSocketTestStompSessionHandler> stompSessionHandlers = new ArrayList<>();

        testStompClients.forEach(client -> {
            WebSocketTestStompSessionHandler testStompSessionHandler =  new WebSocketTestStompSessionHandler();
            stompSessionHandlers.add(testStompSessionHandler);
            StompSession stompSession = client.getStompSession();
            stompSession.subscribe("/topic/chat/participants", testStompSessionHandler);
            stompSession.send("/app/chat/join", RandomString.make(10));
        });
        Thread.sleep(200);
        simpMessagingTemplate.convertAndSend("/topic/chat/participants", "test payload");
        Thread.sleep(200);

        assertEquals(testStompClients.size(),eventListener.getSubscribers().size());
        stompSessionHandlers.forEach(handler -> assertNotNull(handler.getPayload()));
    }

    private List<String> createRandomNames(int numberOfNames) {
        return IntStream.range(0, numberOfNames)
                .boxed()
                .map(num -> RandomString.make(10))
                .collect(Collectors.toList());
    }

    @AfterEach
    public void cleanUp() {
        testApplicationEventListener.setTestSubscribeCalled(false);
    }

}
