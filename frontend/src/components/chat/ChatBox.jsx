import { useState, useEffect, useRef } from 'react';
import {
  X, Minus, Send, Image as ImageIcon,
  Paperclip, Maximize2
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import EmojiPicker from '../ui/EmojiPicker';
import { messageAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { getMediaUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ChatBox({ chat, onClose, onToggleMinimize, offsetIndex = 0 }) {
  const { user: otherUser, minimized } = chat;
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const otherUserId = otherUser?._id || otherUser?.id;
  const otherUserName = otherUser?.firstName
    ? `${otherUser.firstName} ${otherUser.lastName || ''}`
    : otherUser?.username || 'User';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages between current user and otherUser
  const fetchMessages = async () => {
    if (!otherUserId) return;
    try {
      const res = await messageAPI.getMessages(otherUserId);
      const data = res.data?.data?.messages || res.data?.messages || [];
      setMessages(data);
    } catch (err) {
      console.warn('Failed to fetch messages:', err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds while chat box is open
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, mediaPreview]);

  // Handle media file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  // Handle emoji click
  const handleAddEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !mediaFile) return;

    const textToSend = inputText.trim();
    const fileToSend = mediaFile;
    const previewToSend = mediaPreview;

    // Clear input immediately for smooth UX
    setInputText('');
    setMediaFile(null);
    setMediaPreview(null);
    setShowEmojiPicker(false);

    // Optimistic UI update
    const optimisticMessage = {
      _id: 'temp-' + Date.now(),
      sender: {
        _id: currentUser?._id || currentUser?.id,
        firstName: currentUser?.firstName,
        lastName: currentUser?.lastName,
        avatar: currentUser?.avatar,
      },
      recipient: { _id: otherUserId },
      text: textToSend,
      media: previewToSend,
      mediaType: fileToSend?.type.startsWith('video/') ? 'video' : 'image',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('recipientId', otherUserId);
      if (textToSend) formData.append('text', textToSend);
      if (fileToSend) formData.append('media', fileToSend);

      const res = await messageAPI.sendMessage(formData);
      const serverMessage = res.data?.data?.message || res.data?.message;

      if (serverMessage) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMessage._id ? serverMessage : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Keep optimistic message or notify
      toast.error('Message delivery failed');
    } finally {
      setSending(false);
    }
  };

  // Floating offset calculation for multiple open chat windows
  // Each window is 320px wide + 16px gap
  const rightOffset = 16 + offsetIndex * 336;

  // Minimized state pill
  if (minimized) {
    return (
      <div
        style={{ right: `${rightOffset}px` }}
        className="fixed bottom-0 z-50 flex items-center gap-2 bg-white rounded-t-xl px-4 py-2.5 shadow-2xl border border-gray-300 cursor-pointer hover:bg-gray-50 transition-all select-none"
        onClick={() => onToggleMinimize(otherUserId)}
      >
        <Avatar
          src={otherUser?.avatar}
          name={otherUserName}
          size="sm"
          online
        />
        <span className="font-bold text-sm text-[#050505] truncate max-w-[120px]">
          {otherUser?.firstName || otherUserName}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(otherUserId);
          }}
          className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ right: `${rightOffset}px` }}
      className="fixed bottom-0 z-50 w-80 sm:w-88 h-[450px] bg-white rounded-t-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden animate-fade-in select-none"
    >
      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-gray-200 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={otherUser?.avatar}
            name={otherUserName}
            size="sm"
            online
          />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#050505] truncate leading-tight">
              {otherUserName}
            </h4>
            <p className="text-[11px] text-green-600 font-medium leading-none mt-0.5">
              Active now
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-[#65676B]">
          <button
            type="button"
            onClick={() => onToggleMinimize(otherUserId)}
            className="p-1.5 rounded-full hover:bg-[#F2F2F2] hover:text-[#050505] transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onClose(otherUserId)}
            className="p-1.5 rounded-full hover:bg-[#F2F2F2] hover:text-[#050505] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Avatar src={otherUser?.avatar} name={otherUserName} size="lg" />
            <p className="font-bold text-sm text-[#050505] mt-2">{otherUserName}</p>
            <p className="text-xs text-[#65676B] mt-0.5">You're connected on SocialWave</p>
            <p className="text-[11px] text-gray-400 mt-3">Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              (msg.sender?._id || msg.sender?.id || msg.sender)?.toString() ===
              (currentUser?._id || currentUser?.id)?.toString();

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Avatar
                    src={msg.sender?.avatar || otherUser?.avatar}
                    name={otherUserName}
                    size="xs"
                    className="mb-1"
                  />
                )}

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Photo or Video Attachment */}
                  {msg.media && (
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-black/10">
                      {msg.mediaType === 'video' ? (
                        <video
                          src={getMediaUrl(msg.media)}
                          controls
                          className="max-h-48 w-full object-cover rounded-2xl bg-black"
                        />
                      ) : (
                        <img
                          src={getMediaUrl(msg.media)}
                          alt="Attachment"
                          className="max-h-48 w-full object-cover rounded-2xl"
                        />
                      )}
                    </div>
                  )}

                  {/* Text Bubble */}
                  {msg.text && (
                    <div
                      className={`px-3.5 py-2 text-sm leading-snug break-words shadow-xs ${
                        isMe
                          ? 'bg-[#1877F2] text-white rounded-2xl rounded-br-xs'
                          : 'bg-[#E4E6EB] text-[#050505] rounded-2xl rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Attachment Preview Bar */}
      {mediaPreview && (
        <div className="p-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} className="w-12 h-12 object-cover rounded-lg bg-black" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
            )}
            <span className="text-xs text-[#050505] font-medium truncate max-w-[160px]">
              {mediaFile?.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMediaFile(null);
              setMediaPreview(null);
            }}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover — now handled by EmojiPicker component below */}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5"
      >
        {/* Photo/Video Picker Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-[#1877F2] hover:bg-[#EBF3FE] transition-colors cursor-pointer"
          title="Attach Photo or Video"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Emoji Button — using the rich EmojiPicker */}
        <EmojiPicker
          onEmojiSelect={handleAddEmoji}
          position="top-left"
          size="md"
        />

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-3 py-1.5 text-sm bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white rounded-full border border-transparent focus:border-[#1877F2] outline-none text-[#050505] transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !mediaFile}
          className="p-2 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
