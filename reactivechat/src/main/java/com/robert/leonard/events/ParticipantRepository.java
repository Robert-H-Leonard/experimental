package com.robert.leonard.events;

import com.robert.leonard.events.models.UserSession;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ParticipantRepository {

    private final Map<String, UserSession> activeSession = new ConcurrentHashMap<>();

    public void addSession(UserSession userSession) {
        activeSession.put(userSession.getSessionId(), userSession);
    }

    public void removesession(UserSession userSession) {
        activeSession.remove(userSession.getSessionId());
    }

    public UserSession getSession(String sessionId) {
        return activeSession.get(sessionId);
    }
}
