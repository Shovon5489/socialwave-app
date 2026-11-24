import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FriendCard from '../components/FriendCard';
import Loader from '../components/ui/Loader';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, friRes, sugRes] = await Promise.allSettled([
        userAPI.getFriendRequests(),
        userAPI.getFriends(),
        userAPI.getSuggestedFriends(),
      ]);

      if (reqRes.status === 'fulfilled') {
        const reqData = reqRes.value.data?.data?.requests || reqRes.value.data?.requests || [];
        setRequests(reqData);
      }
      if (friRes.status === 'fulfilled') {
        const friData = friRes.value.data?.data?.friends || friRes.value.data?.friends || [];
        setFriends(friData);
      }
      if (sugRes.status === 'fulfilled') {
        const sugData = sugRes.value.data?.data?.suggestions || sugRes.value.data?.suggestions || [];
        setSuggestions(sugData);
      }
    } catch (err) {
      console.error('Error fetching friends data:', err);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (action, userId) => {
    if (action === 'accepted') {
      const acceptedReq = requests.find((r) => (r.from?._id || r.from || r._id) === userId);
      if (acceptedReq) {
        setRequests((prev) => prev.filter((r) => (r.from?._id || r.from || r._id) !== userId));
        setFriends((prev) => [...prev, acceptedReq.from || acceptedReq]);
      }
    } else if (action === 'declined') {
      setRequests((prev) => prev.filter((r) => (r.from?._id || r.from || r._id) !== userId));
    }
  };

  return (
    <MainLayout hideSidebars wide>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connections and discover new people</p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'friends'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Suggestions
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : (
          <div>
            {activeTab === 'requests' && (
              <div>
                {requests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium text-gray-700">No pending friend requests</p>
                    <p className="text-sm mt-1">When people send you a request, it will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {requests.map((req) => {
                      const person = req.from || req;
                      return (
                        <FriendCard
                          key={req._id || person._id}
                          user={person}
                          type="request"
                          onAction={handleAction}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div>
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium text-gray-700">No friends yet</p>
                    <p className="text-sm mt-1">Check out the suggestions tab to connect with people!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <FriendCard
                        key={friend._id}
                        user={friend}
                        type="friend"
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div>
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium text-gray-700">No suggestions right now</p>
                    <p className="text-sm mt-1">Check back later for new people you may know.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestions.map((user) => (
                      <FriendCard
                        key={user._id}
                        user={user}
                        type="suggestion"
                        onAction={handleAction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
