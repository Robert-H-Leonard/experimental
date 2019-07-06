package com.robert.leonard.resources;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

public class WebSocketResource {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public JsonNode greeting(JsonNode message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return message;
    }
}
