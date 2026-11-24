import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import PostCard from '../components/PostCard';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { userAPI, postAPI } from '../utils/api';
import { getMediaUrl, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  MapPin, Globe, Calendar, Edit3, UserPlus, UserCheck,
  UserX, MessageSquare, ShieldCheck
} from 'lucide-react';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [friendStatus, setFriendStatus] = useState('none'); // 'none', 'friends', 'sent', 'received'
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userRes = await userAPI.getProfile(username);
      const userData = userRes.data?.data?.user || userRes.data?.user;
      setProfileUser(userData);

      // Determine friendship status
      if (userData && currentUser) {
        if (userData.friends?.some((f) => (f._id || f) === currentUser._id)) {
          setFriendStatus('friends');
        } else if (userData.friendRequests?.some((r) => (r.from?._id || r.from || r) === currentUser._id)) {
          setFriendStatus('sent');
        } else {
          setFriendStatus('none');
        }
      }

      // Fetch user's posts
      if (userData?._id) {
        const postRes = await postAPI.getUserPosts(userData._id);
        setPosts(postRes.data?.data?.posts || postRes.data?.posts || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('User not found or error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleFriendAction = async () => {
    if (!profileUser?._id) return;
    try {
      setActionLoading(true);
      if (friendStatus === 'none') {
        await userAPI.sendFriendRequest(profileUser._id);
        setFriendStatus('sent');
        toast.success('Friend request sent');
      } else if (friendStatus === 'friends') {
        await userAPI.removeFriend(profileUser._id);
        setFriendStatus('none');
        toast.success('Removed friend');
      } else if (friendStatus === 'sent') {
        await userAPI.declineFriendRequest(profileUser._id);
        setFriendStatus('none');
        toast.success('Cancelled friend request');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout hideSidebars>
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout hideSidebars>
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">User Not Found</h2>
          <p className="text-gray-500 mt-2">The profile you are looking for does not exist.</p>
          <Link to="/feed" className="mt-4 inline-block text-primary font-medium hover:underline">
            Return to Feed
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideSidebars>
      <div className="space-y-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative">
            {profileUser.coverPhoto && (
              <img
                src={getMediaUrl(profileUser.coverPhoto)}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Meta Area */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
              <div className="relative inline-block">
                <Avatar
                  src={profileUser.avatar}
                  name={profileUser.fullName || profileUser.username}
                  size="2xl"
                  className="ring-4 ring-white shadow-md"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm" icon={Edit3}>
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      variant={friendStatus === 'friends' ? 'secondary' : 'primary'}
                      size="sm"
                      loading={actionLoading}
                      onClick={handleFriendAction}
                      icon={
                        friendStatus === 'friends'
                          ? UserCheck
                          : friendStatus === 'sent'
                          ? UserX
                          : UserPlus
                      }
                    >
                      {friendStatus === 'friends'
                        ? 'Friends'
                        : friendStatus === 'sent'
                        ? 'Request Sent'
                        : 'Add Friend'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Name & Bio */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.firstName} {profileUser.lastName}
                </h1>
                {profileUser.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-500">@{profileUser.username}</p>

              {profileUser.bio && (
                <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-2xl">
                  {profileUser.bio}
                </p>
              )}

              {/* Location, Website, Joined */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                {profileUser.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {formatDate(profileUser.createdAt)}</span>
                </div>
              </div>

              {/* Counts */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
                <div>
                  <span className="font-bold text-gray-900">{posts.length}</span>{' '}
                  <span className="text-gray-500">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profileUser.friends?.length || 0}
                  </span>{' '}
                  <span className="text-gray-500">Friends</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profileUser.followers?.length || 0}
                  </span>{' '}
                  <span className="text-gray-500">Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-gray-100 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm">No posts shared yet.</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
                  onUpdate={(up) => setPosts(posts.map((p) => (p._id === up._id ? up : p)))}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">About {profileUser.firstName}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profileUser.bio || 'No bio written yet.'}
            </p>
            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <p><strong>Username:</strong> @{profileUser.username}</p>
              {profileUser.location && <p><strong>Lives in:</strong> {profileUser.location}</p>}
              {profileUser.website && <p><strong>Website:</strong> {profileUser.website}</p>}
              <p><strong>Member since:</strong> {formatDate(profileUser.createdAt)}</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
