import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../firebase/auth';
import { chatService } from '../../firebase/services';
import './CommunityChatPage.css';

const CommunityChatPage = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Get user display name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  // Initialize chat room when selected room changes
  useEffect(() => {
    const initializeRoom = async () => {
      if (user) {
        try {
          const room = chatService.CHAT_CATEGORIES.find(cat => cat.id === selectedRoom);
          if (room) {
            await chatService.initializeChatRoom(selectedRoom, room.name);
            loadMessages();
          }
        } catch (err) {
          console.error('Error initializing chat room:', err);
          setError('Error al cargar el chat');
        }
      }
    };

    initializeRoom();
  }, [selectedRoom, user]);

  // Load messages with real-time subscription
  const loadMessages = () => {
    // Unsubscribe from previous room
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setMessages([]);
    setLoading(true);

    // Subscribe to messages in real-time
    unsubscribeRef.current = chatService.subscribeToMessages(selectedRoom, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      setError('');
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user) {
      return;
    }

    const textToSend = messageText.trim();
    setMessageText('');
    setError('');

    try {
      await chatService.sendMessage(selectedRoom, user.uid, userName, textToSend);
      // Message will be added via real-time subscription
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje. Por favor intenta de nuevo.');
      setMessageText(textToSend); // Restore message text
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedRoomData = chatService.CHAT_CATEGORIES.find(cat => cat.id === selectedRoom);

  return (
    <div className="community-chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <h1 className="chat-title">Chat de la Comunidad</h1>
          <p className="chat-subtitle">
            Conecta con otros usuarios y comparte tus experiencias culinarias
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        {/* Chat Layout */}
        <div className="chat-layout">
          {/* Sidebar - Chat Rooms */}
          <div className="chat-sidebar">
            <h2 className="sidebar-title">Categorías</h2>
            <div className="chat-rooms">
              {chatService.CHAT_CATEGORIES.map((room) => (
                <button
                  key={room.id}
                  className={`chat-room-button ${selectedRoom === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(room.id)}
                  style={{
                    backgroundColor: selectedRoom === room.id ? room.color : 'transparent',
                    borderColor: room.color
                  }}
                >
                  <span className="room-icon">{room.icon}</span>
                  <span className="room-name">{room.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="chat-main">
            {/* Room Header */}
            <div 
              className="room-header"
              style={{ backgroundColor: selectedRoomData?.color || '#50B8B8' }}
            >
              <div className="room-header-content">
                <span className="room-header-icon">{selectedRoomData?.icon}</span>
                <h2 className="room-header-title">{selectedRoomData?.name}</h2>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              {loading && messages.length === 0 ? (
                <div className="loading-messages">
                  <p>Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-messages">
                  <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => {
                    const isOwnMessage = message.userId === user?.uid;
                    return (
                      <div
                        key={message.id}
                        className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                      >
                        <div className={`message-avatar ${isOwnMessage ? 'own-avatar' : ''}`}>
                          {message.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="message-content">
                          <div className="message-author">{message.userName || 'Usuario'}</div>
                          <div className="message-text">{message.text}</div>
                          <div className="message-time">
                            {formatTimestamp(message.timestamp || message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="message-input"
                placeholder="Escribe un mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={!user}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!messageText.trim() || !user}
                style={{ backgroundColor: selectedRoomData?.color || '#50B8B8' }}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChatPage;

