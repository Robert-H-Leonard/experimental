package com.robert.leonard.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;


@Configuration
public class UtilConfig {

    @Bean
    public ObjectMapper defaultObjectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public MappingJackson2MessageConverter defaultMessageConverter() {
        return new MappingJackson2MessageConverter();    }
}
