import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MoreHorizontal, Video, MessageCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { userAPI } from '../../utils/api';
import { useChat } from '../../context/ChatContext';

export default function RightSidebar() {
  const { openChat } = useChat();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadContacts = async () => {
      try {
        const [friendsRes, sugRes] = await Promise.allSettled([
          userAPI.getFriends(),
          userAPI.getSuggestedFriends(),
        ]);

        let list = [];
        if (friendsRes.status === 'fulfilled') {
          const friends = friendsRes.value.data?.data?.friends || friendsRes.value.data?.friends || [];
          list = [...friends];
        }

        // If friends list is short, also include suggestions as contacts
        if (sugRes.status === 'fulfilled') {
          const suggestions = sugRes.value.data?.data?.suggestions || sugRes.value.data?.suggestions || [];
          const existingIds = new Set(list.map((u) => (u._id || u.id)?.toString()));
          for (const s of suggestions) {
            const sid = (s._id || s.id)?.toString();
            if (sid && !existingIds.has(sid)) {
              list.push(s);
              existingIds.add(sid);
            }
          }
        }

        if (isMounted) {
          setContacts(list);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load contacts:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadContacts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 pl-2">
      <div className="sticky top-16 space-y-4">
        {/* Sponsored / SocialWave Link */}
        <div className="pb-3 border-b border-gray-300/70">
          <h3 className="font-bold text-[#65676B] text-[15px] mb-2">Sponsored</h3>
          <a
            href="https://github.com/Shovon5489/socialwave-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#E4E6EB] transition-colors group"
          >
            <div className="w-24 h-16 rounded-lg bg-gradient-to-tr from-[#1877F2] to-blue-700 flex items-center justify-center text-white font-bold text-xs p-2 text-center shadow-sm">
              SocialWave
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[13px] text-[#050505] truncate group-hover:underline">
                SocialWave App
              </p>
              <p className="text-[11px] text-[#65676B] truncate">github.com</p>
            </div>
          </a>
        </div>

        {/* Facebook Contacts Header */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="font-bold text-[#65676B] text-[15px]">Contacts</h3>
            <div className="flex items-center gap-1 text-[#65676B]">
              <button className="p-1.5 rounded-full hover:bg-[#E4E6EB] transition-colors" title="New Call">
                <Video className="w-4 h-4" />
              </button>
              <Link to="/friends" className="p-1.5 rounded-full hover:bg-[#E4E6EB] transition-colors" title="All Friends">
                <Search className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Active Contacts List */}
          <div className="space-y-0.5">
            {loading && contacts.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#65676B]">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#65676B]">
                <p>No contacts yet</p>
                <Link to="/friends" className="text-[#1877F2] font-medium hover:underline mt-1 block">
                  Find friends
                </Link>
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id || contact.id}
                  onClick={() => openChat(contact)}
                  className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-[#E4E6EB] transition-colors group text-left cursor-pointer"
                  title={`Chat with ${contact.firstName}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={contact.avatar}
                        name={`${contact.firstName || ''} ${contact.lastName || ''}`}
                        size="sm"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white" />
                    </div>
                    <p className="text-[14px] font-semibold text-[#050505] truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-[#65676B] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
