import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Bell, Bookmark, Search, LogOut, User, Settings,
  ChevronDown, Menu, X, MessageCircle, Grid, Play,
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
  const [unreadCount] = useState(3);
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
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 h-14">
      <div className="max-w-[1920px] mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Facebook Logo & Search */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link to="/feed" className="flex items-center gap-2 group" title="SocialWave Facebook">
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-black text-2xl tracking-tighter select-none shadow-sm hover:opacity-95 transition-opacity">
                f
              </div>
              <span className="font-bold text-xl text-[#1877F2] hidden xl:inline tracking-tight">facebook</span>
            </Link>

            {/* Facebook Style Search Input */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#65676B]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Facebook"
                  className="pl-9 pr-4 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white border border-transparent focus:border-gray-300 rounded-full text-sm text-[#050505] placeholder-[#65676B] outline-none transition-all w-56 lg:w-64"
                />
              </div>
            </form>
          </div>

          {/* Center: Facebook 4-5 Navigation Tabs */}
          <div className="hidden md:flex items-center h-full gap-1">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                title={label}
                className={`
                  relative flex items-center justify-center h-full px-8 lg:px-11 transition-colors
                  ${isActive(to)
                    ? 'text-[#1877F2] border-b-[3px] border-[#1877F2]'
                    : 'text-[#65676B] hover:bg-[#F2F2F2] rounded-lg my-1 h-12'
                  }
                `}
              >
                <Icon className={`h-6 w-6 ${isActive(to) ? 'stroke-[2.5]' : ''}`} />
                {badge > 0 && (
                  <span className="absolute top-2 right-6 h-4 min-w-4 px-1 rounded-full bg-[#E41E3F] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right: Round Action Buttons & Profile */}
          <div className="flex items-center gap-2">
            {/* Mobile search button */}
            <button
              className="md:hidden w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#050505] transition-colors"
              onClick={() => navigate('/search')}
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Menu (9 dots) */}
            <button
              onClick={() => navigate('/feed')}
              className="hidden sm:flex w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] items-center justify-center text-[#050505] transition-colors"
              title="Menu"
            >
              <Grid className="h-5 w-5" />
            </button>

            {/* Messenger button */}
            <button
              onClick={() => navigate('/notifications')}
              className="hidden sm:flex w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] items-center justify-center text-[#050505] transition-colors"
              title="Messenger"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#050505] transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#E41E3F] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center rounded-full hover:ring-2 hover:ring-[#1877F2]/40 transition-all p-0.5"
                title="Account Controls and Settings"
              >
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  size="md"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 animate-fade-in z-50">
                  {/* User Profile Card */}
                  <Link
                    to={`/profile/${user?.username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F2F2] transition-colors shadow-sm border border-gray-100"
                  >
                    <Avatar
                      src={user?.avatar}
                      name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#050505] text-base truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-[#65676B] truncate">See your profile</p>
                    </div>
                  </Link>

                  <div className="my-2 border-t border-gray-200" />

                  <Link
                    to="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#050505] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                      <Settings className="h-5 w-5 text-[#050505]" />
                    </div>
                    <span>Settings & privacy</span>
                  </Link>

                  <Link
                    to="/saved"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#050505] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                      <Bookmark className="h-5 w-5 text-[#050505]" />
                    </div>
                    <span>Saved items</span>
                  </Link>

                  <div className="my-2 border-t border-gray-200" />

                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#050505] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-[#050505]" />
                    </div>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#050505]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 bg-white animate-fade-in shadow-lg">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm rounded-xl mx-2 font-medium transition-colors
                  ${isActive(to) ? 'text-[#1877F2] bg-[#EBF3FE]' : 'text-[#050505] hover:bg-[#F2F2F2]'}
                `}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[#E41E3F] text-white text-[10px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
