import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FriendCard from '../components/FriendCard';
import PostCard from '../components/PostCard';
import Loader from '../components/ui/Loader';
import { searchAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Search as SearchIcon, Users, FileText } from 'lucide-react';

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getFriendshipType = (personId) => {
    if (!currentUser || !personId) return 'suggestion';
    const isFriend = (currentUser.friends || []).some(
      (f) => (f._id || f?.id || f) === personId
    );
    if (isFriend) return 'friend';

    const hasReceivedReq = (currentUser.friendRequests || []).some(
      (r) => (r.from?._id || r.from?.id || r.from || r) === personId
    );
    if (hasReceivedReq) return 'request';

    const hasSentReq = (currentUser.sentFriendRequests || []).some(
      (r) => (r.to?._id || r.to?.id || r.to || r) === personId
    );
    if (hasSentReq) return 'pending';

    return 'suggestion';
  };

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    try {
      setLoading(true);
      const res = await searchAPI.search(searchTerm);
      const data = res.data?.data || res.data || {};
      setUsers(data.users || []);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  return (
    <MainLayout hideSidebars>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto space-y-6">
        {/* Search header & input */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search SocialWave</h1>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for people, posts, hashtags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-100 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'people'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            People ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Posts ({posts.length})
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : !initialQuery ? (
          <div className="text-center py-16 text-gray-400">
            <p>Type in the search box above to find people and posts.</p>
          </div>
        ) : users.length === 0 && posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-base font-semibold">No results found for "{initialQuery}"</p>
            <p className="text-xs text-gray-400 mt-1">Check spelling or try broader keywords.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* People Section */}
            {(activeTab === 'all' || activeTab === 'people') && users.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  People
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map((person) => (
                    <FriendCard
                      key={person._id}
                      user={person}
                      type={getFriendshipType(person._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Posts
                </h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
