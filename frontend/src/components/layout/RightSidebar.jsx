import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MoreHorizontal, Video } from 'lucide-react';
import Avatar from '../ui/Avatar';

const mockContacts = [
  { _id: '1', firstName: 'Emma', lastName: 'Wilson', username: 'emmaw', online: true },
  { _id: '2', firstName: 'James', lastName: 'Brown', username: 'jbrown', online: true },
  { _id: '3', firstName: 'Sofia', lastName: 'Lee', username: 'sofialee', online: true },
  { _id: '4', firstName: 'Alice', lastName: 'Johnson', username: 'alicej', online: false },
  { _id: '5', firstName: 'Bob', lastName: 'Smith', username: 'bobsmith', online: true },
];

export default function RightSidebar() {
  const [contacts] = useState(mockContacts);

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
              <button className="p-1.5 rounded-full hover:bg-[#E4E6EB] transition-colors" title="Search Contacts">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-[#E4E6EB] transition-colors" title="Options">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Contacts List */}
          <div className="space-y-0.5">
            {contacts.map((contact) => (
              <Link
                key={contact._id}
                to={`/profile/${contact.username}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#E4E6EB] transition-colors group"
              >
                <div className="relative">
                  <Avatar
                    name={`${contact.firstName} ${contact.lastName}`}
                    size="sm"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#31A24C] border-2 border-white" />
                  )}
                </div>
                <p className="text-[14px] font-semibold text-[#050505] truncate">
                  {contact.firstName} {contact.lastName}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
