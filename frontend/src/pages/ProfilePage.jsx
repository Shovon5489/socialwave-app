import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { userAPI, postAPI } from '../utils/api';
import { getMediaUrl, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  MapPin, Globe, Calendar, Edit3, UserPlus, UserCheck,
  UserX, Camera, Plus, MoreHorizontal, Image as ImageIcon,
  ShieldCheck, Briefcase, Home as HomeIcon, Edit,
} from 'lucide-react';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [friendStatus, setFriendStatus] = useState('none');
  const [actionLoading, setActionLoading] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isOwnProfile = currentUser?.username === username;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userRes = await userAPI.getProfile(username);
      const userData = userRes.data?.data?.user || userRes.data?.user;
      setProfileUser(userData);

      if (userData && currentUser) {
        if (userData.friends?.some((f) => (f._id || f) === currentUser._id)) {
          setFriendStatus('friends');
        } else if (userData.friendRequests?.some((r) => (r.from?._id || r.from || r) === currentUser._id)) {
          setFriendStatus('sent');
        } else {
          setFriendStatus('none');
        }
      }

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

  const handleDirectAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setProfileUser((prev) => ({ ...prev, avatar: localUrl }));

    const data = new FormData();
    data.append('avatar', file);

    try {
      toast.loading('Uploading profile picture...', { id: 'avatar-up' });
      const res = await userAPI.uploadAvatar(data);
      const updated = res.data?.data?.user || res.data?.user;
      const avatarUrl = res.data?.data?.avatar || res.data?.avatar || localUrl;
      if (updated && updateUser) updateUser(updated);
      setProfileUser((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success('Profile picture updated!', { id: 'avatar-up' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload picture', { id: 'avatar-up' });
    }
  };

  const handleDirectCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setProfileUser((prev) => ({ ...prev, coverPhoto: localUrl }));

    const data = new FormData();
    data.append('cover', file);

    try {
      toast.loading('Uploading cover photo...', { id: 'cover-up' });
      const res = await userAPI.uploadCover(data);
      const updated = res.data?.data?.user || res.data?.user;
      const coverUrl = res.data?.data?.coverPhoto || res.data?.coverPhoto || localUrl;
      if (updated && updateUser) updateUser(updated);
      setProfileUser((prev) => ({ ...prev, coverPhoto: coverUrl }));
      toast.success('Cover photo updated!', { id: 'cover-up' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload cover photo', { id: 'cover-up' });
    }
  };

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

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Collect photos from posts
  const postPhotos = posts
    .flatMap((p) => (p.media || []).filter((m) => m.type === 'image' || !m.type).map((m) => getMediaUrl(m.url || m)))
    .slice(0, 9);

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
    <MainLayout hideSidebars wide>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Profile Header Card */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 sm:h-72 md:h-80 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative group overflow-hidden">
            {profileUser.coverPhoto && !coverError ? (
              <img
                src={getMediaUrl(profileUser.coverPhoto)}
                alt="Cover"
                onError={() => setCoverError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 opacity-95 flex items-center justify-center">
                <span className="text-white/20 text-7xl select-none">🌊</span>
              </div>
            )}

            {isOwnProfile && (
              <>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#050505] shadow-md flex items-center justify-center transition-all hover:scale-105 z-10 backdrop-blur-sm border border-black/10"
                  title="Edit cover photo"
                  aria-label="Edit cover photo"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-[#050505]" />
                </button>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleDirectCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Profile Details & Action Bar */}
          <div className="px-4 sm:px-8 pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 text-center md:text-left">
                {/* Profile Picture with Camera Overlay */}
                <div className="relative inline-block -mt-16 sm:-mt-20 md:-mt-24 z-10">
                  <Avatar
                    src={profileUser.avatar}
                    name={profileUser.fullName || profileUser.username}
                    size="3xl"
                    className="ring-4 ring-white shadow-xl bg-white rounded-full"
                  />
                  {isOwnProfile && (
                    <>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#050505] shadow-md border-2 border-white transition-all hover:scale-105"
                        title="Update profile picture"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleDirectAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* Name, Friend Count & Bio */}
                <div className="pt-2 md:pt-0">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#050505]">
                      {profileUser.firstName} {profileUser.lastName}
                    </h1>
                    {profileUser.isVerified && (
                      <ShieldCheck className="w-6 h-6 text-[#1877F2] fill-[#1877F2]/10" />
                    )}
                  </div>
                  <p className="text-[14px] sm:text-[15px] font-medium text-[#65676B] mt-0.5">
                    {profileUser.friends?.length || 0} friends
                  </p>
                  {profileUser.bio && (
                    <p className="text-[14px] text-[#050505] mt-1.5 max-w-xl">
                      {profileUser.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons (Facebook exact buttons) */}
              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                {isOwnProfile ? (
                  <>
                    <Link
                      to="/feed?createStory=true"
                      className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-[15px] flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to story</span>
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="px-4 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold text-[15px] flex items-center gap-2 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit profile</span>
                    </Link>
                  </>
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

            {/* Navigation Tabs (Posts, About, Friends, Photos) */}
            <div className="flex items-center gap-1 mt-1 overflow-x-auto">
              {['posts', 'about', 'friends', 'photos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-3 px-4 font-semibold text-[15px] capitalize rounded-lg transition-colors relative
                    ${activeTab === tab
                      ? 'text-[#1877F2]'
                      : 'text-[#65676B] hover:bg-[#F2F2F2]'
                    }
                  `}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Facebook 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Intro, Photos, Friends (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Intro Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h2 className="text-[17px] font-bold text-[#050505]">Intro</h2>
              {profileUser.bio && (
                <p className="text-[14px] text-center text-[#050505] leading-relaxed pb-3 border-b border-gray-100">
                  {profileUser.bio}
                </p>
              )}

              <div className="space-y-3 text-[14px] text-[#050505]">
                {profileUser.location && (
                  <div className="flex items-center gap-3 text-[#65676B]">
                    <HomeIcon className="w-5 h-5 text-[#8C939D] flex-shrink-0" />
                    <span>Lives in <strong className="text-[#050505]">{profileUser.location}</strong></span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center gap-3 text-[#65676B]">
                    <Globe className="w-5 h-5 text-[#8C939D] flex-shrink-0" />
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] hover:underline truncate"
                    >
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[#65676B]">
                  <Calendar className="w-5 h-5 text-[#8C939D] flex-shrink-0" />
                  <span>Joined {formatDate(profileUser.createdAt)}</span>
                </div>
              </div>

              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="w-full mt-2 py-2 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold text-[14px] flex items-center justify-center transition-colors"
                >
                  Edit details
                </Link>
              )}
            </div>

            {/* Photos Preview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-bold text-[#050505]">Photos</h2>
                <button onClick={() => setActiveTab('photos')} className="text-[14px] text-[#1877F2] hover:underline font-medium">
                  See all photos
                </button>
              </div>
              {postPhotos.length === 0 ? (
                <p className="text-xs text-[#65676B] py-4 text-center">No photos uploaded yet</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
                  {postPhotos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt=""
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-full h-24 sm:h-28 object-cover hover:opacity-90 transition-opacity bg-gray-100"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Friends Preview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[17px] font-bold text-[#050505]">Friends</h2>
                <Link to="/friends" className="text-[14px] text-[#1877F2] hover:underline font-medium">
                  See all friends
                </Link>
              </div>
              <p className="text-xs text-[#65676B] mb-3">{profileUser.friends?.length || 0} friends</p>
              <div className="grid grid-cols-3 gap-3">
                {(profileUser.friends || []).slice(0, 6).map((friend) => (
                  <Link key={friend._id || friend} to={`/profile/${friend.username}`} className="group block text-center">
                    <Avatar
                      src={friend.avatar}
                      name={`${friend.firstName || ''} ${friend.lastName || ''}`}
                      size="xl"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto ring-2 ring-gray-100 shadow-sm"
                    />
                    <p className="text-xs font-semibold text-[#050505] mt-1.5 truncate group-hover:underline">
                      {friend.firstName} {friend.lastName}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Create Post & Posts Feed (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Create Post on Own Profile */}
            {isOwnProfile && activeTab === 'posts' && (
              <CreatePost onPostCreated={handlePostCreated} />
            )}

            {/* Tab: Posts */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                    <p className="text-[#65676B] text-[15px] font-medium">No posts shared yet.</p>
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

            {/* Tab: About */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-[#050505] text-lg">About {profileUser.firstName}</h3>
                <p className="text-[15px] text-[#050505] leading-relaxed">
                  {profileUser.bio || 'No bio written yet.'}
                </p>
                <div className="pt-4 border-t border-gray-100 space-y-3 text-[14px] text-[#050505]">
                  <p><strong>Username:</strong> @{profileUser.username}</p>
                  {profileUser.location && <p><strong>Lives in:</strong> {profileUser.location}</p>}
                  {profileUser.website && <p><strong>Website:</strong> {profileUser.website}</p>}
                  <p><strong>Member since:</strong> {formatDate(profileUser.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Tab: Friends */}
            {activeTab === 'friends' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#050505] text-lg mb-4">Friends ({profileUser.friends?.length || 0})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(profileUser.friends || []).map((friend) => (
                    <Link
                      key={friend._id || friend}
                      to={`/profile/${friend.username}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                    >
                      <Avatar
                        src={friend.avatar}
                        name={`${friend.firstName || ''} ${friend.lastName || ''}`}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#050505] truncate hover:underline">
                          {friend.firstName} {friend.lastName}
                        </p>
                        <p className="text-xs text-[#65676B]">@{friend.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Photos */}
            {activeTab === 'photos' && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#050505] text-lg mb-4">Photos</h3>
                {postPhotos.length === 0 ? (
                  <p className="text-[#65676B] text-center py-6">No photos found.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {postPhotos.map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-full h-40 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
