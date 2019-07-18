package com.robert.leonard.events.models;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserSession {

    private String username;
    private LocalDateTime loginTime;
    private String sessionId;
}
