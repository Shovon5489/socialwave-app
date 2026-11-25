import { useChat } from '../../context/ChatContext';
import ChatBox from './ChatBox';

export default function ChatContainer() {
  const { activeChats, closeChat, toggleMinimizeChat } = useChat();

  if (!activeChats || activeChats.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {activeChats.map((chat, index) => {
          const userId = (chat.user?._id || chat.user?.id)?.toString();
          return (
            <ChatBox
              key={userId || index}
              chat={chat}
              offsetIndex={index}
              onClose={closeChat}
              onToggleMinimize={toggleMinimizeChat}
            />
          );
        })}
      </div>
    </div>
  );
}
