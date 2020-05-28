import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';
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


function App() {

  return (
    <MyApp>
      <Form>
        <ChatContainer>
          <Form.Control as="textarea" rows={3} />
        </ChatContainer>
      </Form>
    </MyApp>
  );
}

export default App;
