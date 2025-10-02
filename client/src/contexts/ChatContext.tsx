import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  isVerified: boolean;
  isOwnMessage: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load messages from localStorage
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only keep last 100 messages
        return parsed.slice(-100);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      // Only save last 100 messages to avoid localStorage limits
      localStorage.setItem('chatMessages', JSON.stringify(messages.slice(-100)));
    }
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp
    };

    setMessages(prev => [...prev.slice(-99), newMessage]); // Keep last 100 messages
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};