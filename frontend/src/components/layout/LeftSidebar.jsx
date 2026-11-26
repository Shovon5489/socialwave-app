import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, Bookmark, Search, Settings, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../utils/api';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/feed', icon: Home, label: 'Feed', color: 'text-[#1877F2]' },
  { to: '/friends', icon: Users, label: 'Friends', color: 'text-[#1877F2]' },
  { to: '/saved', icon: Bookmark, label: 'Saved', color: 'text-[#9333EA]' },
  { to: '/notifications', icon: Bell, label: 'Notifications', color: 'text-[#EF4444]' },
  { to: '/search', icon: Search, label: 'Search', color: 'text-[#10B981]' },
];

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    let mounted = true;
    const loadRequests = async () => {
      try {
        const res = await userAPI.getFriendRequests();
        const data = res.data?.data?.requests || res.data?.requests || [];
        if (mounted) setRequests(data);
      } catch (_) {}
    };
    if (user) loadRequests();
    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const handleAccept = async (personId, name) => {
    try {
      await userAPI.acceptFriendRequest(personId);
      setRequests((prev) => prev.filter((r) => (r.from?._id || r.from || r._id) !== personId));
      toast.success(`You and ${name} are now friends!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleDecline = async (personId) => {
    try {
      await userAPI.declineFriendRequest(personId);
      setRequests((prev) => prev.filter((r) => (r.from?._id || r.from || r._id) !== personId));
      toast.success('Friend request deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    }
  };

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

        {/* Real Friend Requests Preview */}
        {requests.length > 0 && (
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-[#050505] text-[14px]">Friend requests ({requests.length})</h3>
              <Link to="/friends" className="text-xs text-[#1877F2] hover:underline font-semibold">
                See all
              </Link>
            </div>
            <div className="space-y-2.5">
              {requests.slice(0, 4).map((req) => {
                const person = req.from || req;
                const personId = person._id || person.id;
                return (
                  <div key={req._id || personId} className="flex items-center gap-2.5">
                    <Link to={`/profile/${person.username}`} className="flex-shrink-0">
                      <Avatar src={person.avatar} name={`${person.firstName || ''} ${person.lastName || ''}`} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${person.username}`} className="text-[13px] font-semibold text-[#050505] truncate block hover:underline">
                        {person.firstName} {person.lastName}
                      </Link>
                      <p className="text-[11px] text-[#65676B] truncate">@{person.username}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAccept(personId, person.firstName)}
                        className="p-1.5 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors cursor-pointer"
                        title="Confirm"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(personId)}
                        className="p-1.5 rounded-full bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF] transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SocialWave Footer */}
        <div className="px-3 pt-3 text-xs text-[#65676B] space-y-1">
          <p className="leading-relaxed">
            Privacy · Terms · Advertising · Cookies · SocialWave © 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
