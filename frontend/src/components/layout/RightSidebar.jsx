import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, UserPlus, Hash } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { searchAPI, userAPI } from '../../utils/api';

// Mock suggested users data
const mockSuggested = [
  { _id: '1', firstName: 'Emma', lastName: 'Wilson', username: 'emmaw', mutualFriends: 5 },
  { _id: '2', firstName: 'James', lastName: 'Brown', username: 'jbrown', mutualFriends: 2 },
  { _id: '3', firstName: 'Sofia', lastName: 'Lee', username: 'sofialee', mutualFriends: 8 },
];

const mockTrending = [
  { tag: '#technology', posts: 1240 },
  { tag: '#programming', posts: 892 },
  { tag: '#webdev', posts: 654 },
  { tag: '#design', posts: 441 },
  { tag: '#opensource', posts: 320 },
];

export default function RightSidebar() {
  const [suggested, setSuggested] = useState(mockSuggested);
  const [trending, setTrending] = useState(mockTrending);
  const [addedFriends, setAddedFriends] = useState(new Set());

  const handleAddFriend = async (userId) => {
    try {
      await userAPI.sendFriendRequest(userId);
      setAddedFriends((prev) => new Set([...prev, userId]));
    } catch {
      // For demo, just toggle local state
      setAddedFriends((prev) => new Set([...prev, userId]));
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* People You May Know */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-dark text-sm">People You May Know</h3>
            <Link to="/friends" className="text-xs text-primary hover:underline font-medium">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {suggested.map((person) => (
              <div key={person._id} className="flex items-center gap-3">
                <Avatar
                  name={`${person.firstName} ${person.lastName}`}
                  src={person.avatar}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${person.username}`}
                    className="text-sm font-medium text-dark truncate block hover:text-primary transition-colors"
                  >
                    {person.firstName} {person.lastName}
                  </Link>
                  <p className="text-xs text-muted">{person.mutualFriends} mutual friends</p>
                </div>
                <button
                  onClick={() => handleAddFriend(person._id)}
                  className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    addedFriends.has(person._id)
                      ? 'bg-gray-100 text-muted'
                      : 'bg-primary-50 text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {addedFriends.has(person._id) ? 'Sent' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Hashtags */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-dark text-sm">Trending</h3>
          </div>
          <div className="space-y-2">
            {trending.map(({ tag, posts }, index) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-medium w-4">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-dark group-hover:text-primary transition-colors">
                      {tag}
                    </p>
                    <p className="text-xs text-muted">{posts.toLocaleString()} posts</p>
                  </div>
                </div>
                <Hash className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-2">
          <p className="text-xs text-muted leading-relaxed">
            Privacy · Terms · Advertising · Cookies ·{' '}
            <span className="font-medium">SocialWave © 2024</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
