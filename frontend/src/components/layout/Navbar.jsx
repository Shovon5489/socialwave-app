import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Bell, Bookmark, Search, LogOut, User, Settings,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount] = useState(3); // TODO: connect to real notification count
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/feed', icon: Home, label: 'Home' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-2">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌊</span>
            <span className="font-bold text-xl text-primary hidden sm:block">SocialWave</span>
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs ml-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SocialWave..."
                className="w-full pl-9 pr-4 py-2 bg-background rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </form>

          {/* Center Nav Icons (desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                title={label}
                className={`
                  relative flex items-center justify-center h-10 w-14 rounded-xl transition-all duration-200
                  ${isActive(to)
                    ? 'text-primary bg-primary-50'
                    : 'text-muted hover:text-dark hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute top-0.5 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right: User Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Mobile search */}
            <button
              className="md:hidden p-2 rounded-full text-muted hover:bg-gray-100"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  size="sm"
                />
                <ChevronDown className={`h-4 w-4 text-muted hidden sm:block transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-dark text-sm">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted">@{user?.username}</p>
                  </div>
                  <Link
                    to={`/profile/${user?.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-muted" />
                    Your Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted" />
                    Edit Profile
                  </Link>
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-full text-muted hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2 animate-fade-in">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm rounded-xl mx-1 transition-colors
                  ${isActive(to) ? 'text-primary bg-primary-50 font-medium' : 'text-dark hover:bg-gray-50'}
                `}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
