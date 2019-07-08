package com.robert.leonard.utils.stomp;

import lombok.Getter;
import lombok.Setter;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TestStompClientImpl {

    private final List<Transport> transports = new ArrayList<>();

    private WebSocketStompClient webSocketStompClient;
    private StompSession stompSession;
    private Transport webSocketTransport;
    private WebSocketClient sockJsWebsocketClient;

    public TestStompClientImpl initClient() {
        return createWebSocketSocketJsTransport().
        createSockJsClient().
        createStompClient();
    }

    //TODO Send failure result to exception url
    public void connectToStompWebSocketServer(String baseUrl) {
        webSocketStompClient.connect(baseUrl , new StompSessionHandlerAdapter() {})
                .addCallback(this::setStompSession, failResult -> stompSession = null);
    }
    private TestStompClientImpl createStompClient() {
        this. webSocketStompClient =  new WebSocketStompClient(sockJsWebsocketClient);
        this.webSocketStompClient.setMessageConverter(new MappingJackson2MessageConverter());

        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        this.webSocketStompClient.setTaskScheduler(taskScheduler);

        taskScheduler.initialize();
        return this;
    }

    private TestStompClientImpl createSockJsClient() {
       this.sockJsWebsocketClient = new SockJsClient(this.transports);
       return this;
    }

    private TestStompClientImpl createWebSocketSocketJsTransport() {
        this.webSocketTransport = new WebSocketTransport(new StandardWebSocketClient());
        this.transports.add(this.webSocketTransport);
        return this;
    }

}
