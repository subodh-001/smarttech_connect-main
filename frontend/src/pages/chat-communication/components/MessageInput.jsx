import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MessageInput = ({ 
  onSendMessage, 
  onSendImage, 
  onSendLocation, 
  isTyping = false,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const quickResponses = [
    "I\'m on my way",
    "Running 10 minutes late",
    "Job completed successfully",
    "Please share your location",
    "Thank you for your service",
    "When can you arrive?",
    "What\'s the estimated cost?",
    "Is the issue resolved?"
  ];

  const commonEmojis = ['👍', '👎', '😊', '😔', '🔧', '⚡', '✅', '❌', '🚗', '📍', '💰', '⏰'];

  const handleSendMessage = () => {
    if (message?.trim() && !disabled) {
      onSendMessage({
        type: 'text',
        content: message?.trim(),
        timestamp: new Date()
      });
      setMessage('');
      setShowQuickResponses(false);
      if (textareaRef?.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e?.target?.value);
    
    // Auto-resize textarea
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef?.current?.scrollHeight, 120) + 'px';
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file && file?.type?.startsWith('image/')) {
      onSendImage(file);
    }
    e.target.value = '';
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef?.current?.focus();
  };

  const handleQuickResponse = (response) => {
    onSendMessage({
      type: 'text',
      content: response,
      timestamp: new Date()
    });
    setShowQuickResponses(false);
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          onSendLocation({
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
            timestamp: new Date()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="bg-surface border-t border-border">
      {/* Quick Responses */}
      {showQuickResponses && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Quick Responses</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickResponses(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickResponses?.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse(response)}
                className="text-left justify-start text-xs"
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Emojis</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonEmojis?.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-text-secondary">Typing...</span>
          </div>
        </div>
      )}
      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-end space-x-2">
          {/* Attachment Options */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef?.current?.click()}
              disabled={disabled}
            >
              <Icon name="Paperclip" size={18} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLocationShare}
              disabled={disabled}
            >
              <Icon name="MapPin" size={18} />
            </Button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={disabled}
              className="w-full px-4 py-2 pr-20 bg-muted border border-border rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm max-h-32 min-h-[40px]"
              rows={1}
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                className="w-6 h-6"
              >
                <Icon name="Smile" size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuickResponses(!showQuickResponses)}
                disabled={disabled}
                className="w-6 h-6"
              >
                <Icon name="Zap" size={16} />
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <Button
            variant={message?.trim() ? "default" : "ghost"}
            size="icon"
            onClick={handleSendMessage}
            disabled={!message?.trim() || disabled}
            className="flex-shrink-0"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>

        {/* Character Count */}
        {message?.length > 200 && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${message?.length > 500 ? 'text-error' : 'text-text-secondary'}`}>
              {message?.length}/500
            </span>
          </div>
        )}
      </div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;