import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

// Extended emoji categories for a richer picker
const EMOJI_CATEGORIES = {
  '😊 Smileys': [
    '😀','😁','😂','🤣','😃','😄','😅','😆',
    '😉','😊','😋','😎','😍','🥰','😘','😗',
    '😙','😚','🙂','🤗','🤩','🥳','😏','😒',
    '😞','😔','😟','😕','🙁','☹️','😣','😖',
    '😫','😩','🥺','😢','😭','😤','😠','😡',
    '🤬','🤯','😳','🥵','🥶','😱','😨','😰',
    '😥','😓','🤔','🤭','😶','😑','😬','🙄',
  ],
  '👋 Gestures': [
    '👍','👎','👏','🙌','👐','🤲','🤝','🙏',
    '✌️','🤞','🤟','🤘','🤙','👈','👉','👆',
    '👇','☝️','✋','🤚','🖐','🖖','💪','🦾',
    '🫶','🫵','🫳','🫴','🤌','👋','🤏','🫰',
  ],
  '❤️ Hearts & Love': [
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
    '🤎','💔','❣️','💕','💞','💓','💗','💖',
    '💘','💝','💟','♥️','🫀','💏','💑','👫',
    '😍','🥰','😘','💋','💌','💍','💎','🌹',
  ],
  '🎉 Celebration': [
    '🎉','🎊','🎈','🎁','🎀','🥂','🍾','🎂',
    '🎆','🎇','✨','⭐','🌟','💫','🔥','💥',
    '🏆','🥇','🎖️','🏅','🎗️','🎟️','🎫','🤩',
    '🥳','🎶','🎵','🎸','🎺','🎷','🎹','🪩',
  ],
  '😹 Animals': [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
    '🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈',
    '🙉','🙊','🐔','🐧','🐦','🦆','🦅','🦉',
    '🐺','🦝','🦨','🦡','🦦','🦥','🐁','🐿️',
  ],
  '🍕 Food & Drink': [
    '🍕','🍔','🌮','🌯','🥗','🍜','🍣','🍱',
    '🍦','🎂','🍰','🧁','🍫','🍬','🍭','🍩',
    '☕','🧋','🥤','🍵','🧃','🥛','🍺','🥂',
    '🍎','🍊','🍋','🍇','🍓','🫐','🍑','🥝',
  ],
  '✈️ Travel': [
    '✈️','🚀','🛸','🚂','🚗','🏖️','🏝️','⛰️',
    '🗼','🏯','🗽','🌃','🌆','🌇','🌉','🌌',
    '🌈','🌊','🏄','🧳','🗺️','🧭','🏕️','⛺',
  ],
  '💡 Objects': [
    '📱','💻','⌨️','🖥️','🖨️','📸','📷','🎥',
    '📺','📻','🎮','🕹️','🎯','🎲','♟️','🧩',
    '💡','🔦','📚','📖','📝','✏️','🖊️','📌',
    '🔑','🔒','🔓','🛒','💼','🧲','🔧','⚙️',
  ],
};

export default function EmojiPicker({ onEmojiSelect, buttonClassName = '', position = 'top-right', size = 'md' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmoji = (emoji) => {
    onEmojiSelect(emoji);
    // Don't close after selection — let user pick more
  };

  const positionClass = {
    'top-right': 'bottom-10 right-0',
    'top-left': 'bottom-10 left-0',
    'bottom-right': 'top-10 right-0',
    'top-center': 'bottom-10 left-1/2 -translate-x-1/2',
  }[position] || 'bottom-10 right-0';

  const panelWidth = size === 'sm' ? 'w-64' : 'w-80';
  const emojiSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={buttonClassName || `p-2 rounded-full transition-colors ${
          isOpen ? 'bg-amber-100 text-amber-500' : 'text-amber-500 hover:bg-amber-50'
        }`}
        title="Pick Emoji"
        aria-label="Open emoji picker"
      >
        <Smile className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${positionClass} ${panelWidth} z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}
          style={{ minHeight: 220 }}
        >
          {/* Category Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto px-1 pt-1 gap-0.5 bg-gray-50 scrollbar-hide">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => {
              const icon = cat.split(' ')[0];
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  title={cat}
                  className={`flex-shrink-0 px-2 py-1.5 rounded-t-lg text-base transition-colors ${
                    isActive
                      ? 'bg-white border-b-2 border-[#1877F2] text-[#1877F2]'
                      : 'text-[#65676B] hover:bg-white/70'
                  }`}
                >
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Category Label */}
          <div className="px-3 py-1 text-[10px] font-semibold text-[#65676B] uppercase tracking-wider bg-white border-b border-gray-100">
            {activeCategory.split(' ').slice(1).join(' ')}
          </div>

          {/* Emoji Grid */}
          <div className="p-2 grid grid-cols-8 gap-0.5 overflow-y-auto max-h-44">
            {(EMOJI_CATEGORIES[activeCategory] || []).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmoji(emoji)}
                className={`${emojiSize} p-1 rounded-lg hover:bg-[#F0F2F5] transition-transform hover:scale-125 flex items-center justify-center cursor-pointer leading-none`}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
