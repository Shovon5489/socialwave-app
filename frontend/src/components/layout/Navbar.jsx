import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Bell, Bookmark, Search, LogOut, User, Settings,
  ChevronDown, Menu, X, MessageCircle, Grid, Play,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { searchAPI } from '../../utils/api';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadCount] = useState(3);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults({ users: [], posts: [] });
      setSearchDropdownOpen(false);
      return;
    }

    setSearchDropdownOpen(true);
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchAPI.search(q);
        const data = res.data?.data || res.data || {};
        setSearchResults({
          users: data.users || [],
          posts: data.posts || [],
        });
      } catch (err) {
        console.warn('Navbar live search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDropdownOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const profileUrl = user?.username ? `/profile/${user.username}` : '/profile';

  const navLinks = [
    { to: '/feed', icon: Home, label: 'Home' },
    { to: profileUrl, icon: User, label: 'Profile' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 h-14">
      <div className="max-w-[1920px] mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: SocialWave Logo & Search */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link to="/feed" className="flex items-center gap-2 group" title="SocialWave">
              <span className="text-3xl leading-none">🌊</span>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#1877F2] to-blue-700 bg-clip-text text-transparent hidden sm:inline">
                SocialWave
              </span>
            </Link>

            {/* Search Input with Facebook-style Live Results Dropdown */}
            <div ref={searchContainerRef} className="relative hidden md:flex items-center ml-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#65676B]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim()) setSearchDropdownOpen(true);
                    }}
                    placeholder="Search SocialWave"
                    className="pl-9 pr-4 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white border border-transparent focus:border-[#1877F2] rounded-full text-sm text-[#050505] placeholder-[#65676B] outline-none transition-all w-52 lg:w-72 shadow-inner focus:shadow-md"
                  />
                </div>
              </form>

              {/* Live Search Floating Dropdown */}
              {searchDropdownOpen && searchQuery.trim() && (
                <div className="absolute left-0 top-full mt-2 w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in divide-y divide-gray-100">
                  {/* Results Header */}
                  <div className="p-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#65676B] uppercase tracking-wider">
                      Search Results
                    </span>
                    {searchLoading && (
                      <div className="w-3.5 h-3.5 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Users / Friends list */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {searchResults.users.length > 0 ? (
                      searchResults.users.map((person) => {
                        const isFriend = (user?.friends || []).some(
                          (f) => (f._id || f?.id || f) === person._id
                        );
                        return (
                          <div
                            key={person._id}
                            onClick={() => {
                              navigate(`/profile/${person.username}`);
                              setSearchDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2.5 px-3 hover:bg-[#F2F2F2] cursor-pointer transition-colors"
                          >
                            <Avatar
                              src={person.avatar}
                              name={`${person.firstName || ''} ${person.lastName || ''}`}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm text-[#050505] truncate">
                                  {person.firstName} {person.lastName}
                                </p>
                                {isFriend && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#1877F2]">
                                    Friend
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#65676B] truncate">
                                @{person.username}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      !searchLoading && (
                        <div className="p-4 text-center text-sm text-[#65676B]">
                          No people found for "{searchQuery}"
                        </div>
                      )
                    )}
                  </div>

                  {/* View all search results button */}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full p-3 flex items-center gap-2.5 text-sm font-semibold text-[#1877F2] hover:bg-blue-50/60 transition-colors text-left cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#1877F2]" />
                    <span>See all results for "{searchQuery}"</span>
                  </button>
                </div>
              )}
            </div>
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

            {/* Direct Profile Pill Button */}
            <Link
              to={profileUrl}
              className="flex items-center gap-2 py-1 px-2.5 rounded-full hover:bg-[#F2F2F2] transition-colors"
              title="Go to your profile"
            >
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                size="sm"
              />
              <span className="font-bold text-[14px] text-[#050505] hidden xl:inline">
                {user?.firstName || 'Profile'}
              </span>
            </Link>

            {/* Profile Settings Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#050505] transition-colors"
                title="Account Controls and Settings"
              >
                <ChevronDown className={`h-5 w-5 text-[#050505] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
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
            {/* Mobile Search Input */}
            <form onSubmit={handleSearch} className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#65676B]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SocialWave"
                  className="w-full pl-9 pr-4 py-2 bg-[#F0F2F5] rounded-full text-sm outline-none border border-transparent focus:border-[#1877F2]"
                />
              </div>
            </form>
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
