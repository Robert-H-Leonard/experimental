package com.robert.leonard.utils.stomp;

public class TestStompClientFactory {

    public TestStompClientImpl getStompClient() {
        return  new TestStompClientImpl()
                .initClient();
    }
}
