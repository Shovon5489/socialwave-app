import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bell, Bookmark, Search, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const navLinks = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/saved', icon: Bookmark, label: 'Saved Posts' },
  { to: '/search', icon: Search, label: 'Search' },
];

// Mock data for friend requests preview
const mockRequests = [
  { id: '1', firstName: 'Alice', lastName: 'Johnson', username: 'alicej', mutualFriends: 3 },
  { id: '2', firstName: 'Bob', lastName: 'Smith', username: 'bobsmith', mutualFriends: 1 },
];

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-2">
        {/* User Card */}
        <Link
          to={`/profile/${user?.username}`}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-card transition-all duration-200 group"
        >
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="md"
            online
          />
          <div className="min-w-0">
            <p className="font-semibold text-dark text-sm truncate group-hover:text-primary transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted truncate">@{user?.username}</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="bg-white rounded-2xl shadow-card p-2">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(to)
                  ? 'bg-primary-50 text-primary'
                  : 'text-dark hover:bg-gray-50 hover:text-primary'
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Friend Requests Preview */}
        {mockRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-dark text-sm">Friend Requests</h3>
              <Link to="/friends" className="text-xs text-primary hover:underline font-medium">
                See All
              </Link>
            </div>
            <div className="space-y-3">
              {mockRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <Avatar name={`${req.firstName} ${req.lastName}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="text-xs text-muted">{req.mutualFriends} mutual</p>
                  </div>
                  <button className="p-1.5 rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-2">
          <p className="text-xs text-muted">
            © 2024 SocialWave · Privacy · Terms · Cookies
          </p>
        </div>
      </div>
    </aside>
  );
}
