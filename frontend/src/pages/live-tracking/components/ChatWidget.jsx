import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import { formatTechnicianName } from '../../../utils/formatTechnicianName';

const ChatWidget = ({
  isOpen,
  onToggle,
  onClose,
  onOpen,
  technician,
  messages = [],
  onSendMessage,
  isSending = false,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const effectiveToggle = onToggle || (() => {
    if (isOpen) {
      onClose?.();
    } else {
      onOpen?.();
    }
  });

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setNewMessage('');
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText) => {
    const trimmed = messageText?.trim();
    if (!trimmed || isSending) {
      return;
    }
    await onSendMessage?.(trimmed);
    setNewMessage('');

    setIsTyping(true);
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    return () => clearTimeout(timeout);
  };

  const handleQuickReply = (reply) => {
    setNewMessage(reply);
    handleSendMessage(reply);
  };

  const handleSubmit = () => {
    handleSendMessage(newMessage);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSubmit();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp)?.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const quickReplies = [
    'How long will it take?',
    'Do you need any materials?',
    'Can you call me?',
    "I'm not at home right now",
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={effectiveToggle}
          className="relative h-14 w-14 rounded-full trust-shadow-lg"
          size="icon"
        >
          <Icon name="MessageCircle" size={24} />
          {messages?.some((m) => !m?.read && m?.sender !== 'user') && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {messages?.filter((m) => !m?.read && m?.sender !== 'user')?.length}
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-96 w-80 flex-col rounded-lg border border-border bg-card trust-shadow-lg">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <Image
            src={technician?.avatar}
            alt={technician?.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-foreground">
              {formatTechnicianName(technician)}
            </h4>
            {technician?.email && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {technician?.email}
              </p>
            )}
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={effectiveToggle}
          className="h-8 w-8"
        >
          <Icon name="X" size={16} />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages?.map((message) => (
          <div
            key={message?.id}
            className={`flex ${message?.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                message?.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message?.type === 'image' && message?.metadata?.imageUrl ? (
                <div className="mb-2 overflow-hidden rounded-md">
                  <Image
                    src={message.metadata.imageUrl}
                    alt={message?.metadata?.caption || 'Shared image'}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ) : null}
              <p className="whitespace-pre-line">{message?.content}</p>
              <span
                className={`mt-1 block text-xs ${
                  message?.sender === 'user'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}
              >
                {formatMessageTime(message?.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border px-4 py-2">
        <div className="flex flex-wrap gap-1">
          {quickReplies?.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="trust-transition rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-primary hover:text-primary-foreground"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e?.target?.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={isSending || !newMessage?.trim()} size="icon">
            <Icon name="Send" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;