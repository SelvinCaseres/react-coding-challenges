import React, { useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  const [message, setMessage ] = useState();
  const [messages, setMessages ] = useState([{message: initialBottyMessage, user: "bot", botTyping: false}]);
  const [botTyping, setBotTyping] = useState(false);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const sendMessage = async () => {
    playSend();

    setMessages((prev) => [...prev, {message: message, user: "me"}])
    setLatestMessage("bot", message);
    
    socket.emit("user-message", message); 
  }

  useEffect(() => {
    socket.on('bot-message', (botmsg) => {
      
    setBotTyping(false);
    setMessages((prev) => [...prev, {message: botmsg, user: "bot"}])
    setLatestMessage("bot", botmsg);
    playReceive();
    
  });

    return () => {
    socket.off('bot-message');
  };}, []);

  useEffect(() => {
    socket.on('bot-typing', () => {
    setBotTyping(true);
  });

    return () => {
    socket.off('bot-typing');
  };}, []);

  const onChangeMessage = (input) =>{
    setMessage(input);
  }

const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, botTyping]);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <Message key={index} message={msg} nextMessage={messages[index + 1]} />
        ))}
        {botTyping ? <TypingMessage /> : null}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;