import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { NewRoomConnectionEvent } from '../../../common/event'
import moment from "moment";
import styled from 'styled-components';
import io from 'socket.io-client';
import './App.css';


const MyApp = styled.div`
  text-align: center;
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const ChatContainer = styled(Form.Group)`
  flex-direction: column;
  justify-content: center;
`

const socket = io('/general');


function App() {

  console.log("Creating app")
  const [username, setUsername] = useState(`anon-${(Math.random() * 100 + 1) % 100}`);
  const [users, setUsers] = useState([] as string[]);

  const connectToGeneralChatroom = () => {
    const event: NewRoomConnectionEvent = {
      eventType: "newRoomConnection",
      eventData: {
        data: {
          username
        }
      },
      createdAt: moment().fromNow().toString()
    }
    socket.emit(event.eventType, event, (users: string[]) => setUsers(users))
  }

  const newUserJoinedRoom = () => {
    socket.on('joinedRoom', (event: NewRoomConnectionEvent) => {
      console.log(`New User: ${event.eventData.data.username} has joined the room!`);
      setUsers([...users, event.eventData.data.username]);
    })
  }

  useEffect(() => login(username), []);
  useEffect(() => newUserJoinedRoom(), []);

  return (
    <MyApp>
      <Form>
        <ChatContainer>
          <Form.Control as="textarea" rows={3} />
          <Button variant="primary" onClick={connectToGeneralChatroom}>Primary</Button>
        </ChatContainer>
      </Form>
    </MyApp>
  );
}

const login = (username: string) => {
  console.log(`User ${username} logging in!`)
  socket.emit('login', username);
}


export default App;
