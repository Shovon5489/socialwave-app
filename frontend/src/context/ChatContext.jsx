import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // Array of active chat windows: [{ user, minimized: false }]
  const [activeChats, setActiveChats] = useState([]);

  // Open chat with a user
  const openChat = (chatUser) => {
    if (!chatUser) return;
    const targetId = (chatUser._id || chatUser.id)?.toString();
    if (!targetId) return;

    setActiveChats((prev) => {
      const exists = prev.find((c) => (c.user._id || c.user.id)?.toString() === targetId);
      if (exists) {
        // Unminimize if minimized
        return prev.map((c) =>
          (c.user._id || c.user.id)?.toString() === targetId
            ? { ...c, minimized: false }
            : c
        );
      }
      // Maximum 2 floating chat windows open at a time (like Facebook)
      const list = prev.length >= 2 ? prev.slice(1) : prev;
      return [...list, { user: chatUser, minimized: false }];
    });
  };

  const closeChat = (userId) => {
    const targetId = userId?.toString();
    setActiveChats((prev) => prev.filter((c) => (c.user._id || c.user.id)?.toString() !== targetId));
  };

  const toggleMinimizeChat = (userId) => {
    const targetId = userId?.toString();
    setActiveChats((prev) =>
      prev.map((c) =>
        (c.user._id || c.user.id)?.toString() === targetId
          ? { ...c, minimized: !c.minimized }
          : c
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        activeChats,
        openChat,
        closeChat,
        toggleMinimizeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
