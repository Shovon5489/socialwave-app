import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, Bookmark, Search, UserPlus, Settings, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const navLinks = [
  { to: '/feed', icon: Home, label: 'Feed', color: 'text-[#1877F2]' },
  { to: '/friends', icon: Users, label: 'Friends', color: 'text-[#1877F2]' },
  { to: '/saved', icon: Bookmark, label: 'Saved', color: 'text-[#9333EA]' },
  { to: '/notifications', icon: Bell, label: 'Notifications', color: 'text-[#EF4444]' },
  { to: '/search', icon: Search, label: 'Search', color: 'text-[#10B981]' },
];

const mockRequests = [
  { id: '1', firstName: 'Alice', lastName: 'Johnson', username: 'alicej', mutualFriends: 3 },
  { id: '2', firstName: 'Bob', lastName: 'Smith', username: 'bobsmith', mutualFriends: 1 },
];

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 pr-2">
      <div className="sticky top-16 space-y-1">
        {/* User Profile Link */}
        <Link
          to={`/profile/${user?.username}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors group"
        >
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="md"
            online
          />
          <div className="min-w-0">
            <p className="font-semibold text-[#050505] text-[15px] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#65676B] truncate">@{user?.username}</p>
          </div>
        </Link>

        {/* Facebook Style Nav Links */}
        <nav className="space-y-0.5">
          {navLinks.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-colors
                ${isActive(to)
                  ? 'bg-[#EBF3FE] text-[#1877F2]'
                  : 'text-[#050505] hover:bg-[#E4E6EB]'
                }
              `}
            >
              <Icon className={`h-6 w-6 flex-shrink-0 ${isActive(to) ? 'text-[#1877F2]' : color}`} />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/profile/edit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold text-[#050505] hover:bg-[#E4E6EB] transition-colors"
          >
            <Settings className="h-6 w-6 text-[#6B7280] flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="my-2 border-t border-gray-300/70" />

        {/* Friend Requests Preview */}
        {mockRequests.length > 0 && (
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-[#050505] text-[14px]">Friend requests</h3>
              <Link to="/friends" className="text-xs text-[#1877F2] hover:underline font-semibold">
                See all
              </Link>
            </div>
            <div className="space-y-2.5">
              {mockRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-2.5">
                  <Avatar name={`${req.firstName} ${req.lastName}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#050505] truncate">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="text-[11px] text-[#65676B]">{req.mutualFriends} mutual friends</p>
                  </div>
                  <button className="p-1.5 rounded-full bg-[#EBF3FE] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facebook Style Footer */}
        <div className="px-3 pt-3 text-xs text-[#65676B] space-y-1">
          <p className="leading-relaxed">
            Privacy · Terms · Advertising · Ad Choices · Cookies · More · Meta © 2024
          </p>
        </div>
      </div>
    </aside>
  );
}
