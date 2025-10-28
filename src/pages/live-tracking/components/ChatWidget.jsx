import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const ChatWidget = ({ 
  isOpen, 
  onToggle, 
  technician, 
  messages, 
  onSendMessage 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage?.trim()) {
      onSendMessage(newMessage?.trim());
      setNewMessage('');
      
      // Simulate technician typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const quickReplies = [
    "How long will it take?",
    "Do you need any materials?",
    "Can you call me?",
    "I\'m not at home right now"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={onToggle}
          className="w-14 h-14 rounded-full trust-shadow-lg relative"
          size="icon"
        >
          <Icon name="MessageCircle" size={24} />
          {messages?.some(m => !m?.read && m?.sender !== 'user') && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {messages?.filter(m => !m?.read && m?.sender !== 'user')?.length}
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-card border border-border rounded-lg trust-shadow-lg z-40 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Image
            src={technician?.avatar}
            alt={technician?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-foreground">{technician?.name}</h4>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-8 h-8"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.map((message) => (
          <div
            key={message?.id}
            className={`flex ${message?.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message?.sender === 'user' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground'
              }`}
            >
              <p>{message?.content}</p>
              <span className={`text-xs mt-1 block ${
                message?.sender === 'user' ?'text-primary-foreground/70' :'text-muted-foreground'
              }`}>
                {formatMessageTime(message?.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground px-3 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex flex-wrap gap-1">
          {quickReplies?.map((reply, index) => (
            <button
              key={index}
              onClick={() => {
                setNewMessage(reply);
                handleSendMessage();
              }}
              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground trust-transition"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e?.target?.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage?.trim()}
            size="icon"
          >
            <Icon name="Send" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;