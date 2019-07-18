let username;

const init = (event) => {
   event.preventDefault();
   var sockJS = new SockJS('/basepath');
    stompClient = Stomp.over(sockJS);
    console.log('Connecting!!!!');

    username = $("#username").val();

    stompClient.connect({}, connect);
}

const connect = () => {
    console.log(username);
    stompClient.send('/app/chat.addUser', {} , JSON.stringify({'userName': username}));
}

const onMessageReceive = (payload) => {
    console.log("Got message! ------ ", payload);
}

const getUsername = () => {
   return username;
}

$(document).ready(
   () => $("#submitName").click(event => init(event))
);

