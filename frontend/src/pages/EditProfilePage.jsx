import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../utils/api';
import { getMediaUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Camera, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [coverPreview, setCoverPreview] = useState(user?.coverPhoto || null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userAPI.updateProfile(formData);
      const updated = res.data?.data?.user || res.data?.user;
      if (updated && updateUser) updateUser(updated);
      toast.success('Profile updated successfully!');
      navigate(`/profile/${user?.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    const data = new FormData();
    data.append('avatar', file);

    try {
      toast.loading('Uploading profile picture...', { id: 'avatar-upload' });
      const res = await userAPI.uploadAvatar(data);
      const updated = res.data?.data?.user || res.data?.user;
      if (updated && updateUser) updateUser(updated);
      toast.success('Profile picture updated!', { id: 'avatar-upload' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture', { id: 'avatar-upload' });
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('cover', file);

    try {
      toast.loading('Uploading cover...', { id: 'cover-upload' });
      const res = await userAPI.uploadCover(data);
      const updated = res.data?.data?.user || res.data?.user;
      if (updated && updateUser) updateUser(updated);
      toast.success('Cover photo updated!', { id: 'cover-upload' });
    } catch (err) {
      toast.error('Failed to upload cover photo', { id: 'cover-upload' });
    }
  };

  return (
    <MainLayout hideSidebars>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* Photos section */}
        <div className="space-y-6 mb-8 pb-6 border-b border-gray-200">
          {/* Cover Photo Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[15px] font-bold text-[#050505]">Cover Photo</label>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="text-[14px] font-semibold text-[#1877F2] hover:bg-[#EBF3FE] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Cover</span>
              </button>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="h-44 sm:h-52 w-full rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
              {coverPreview || user?.coverPhoto ? (
                <img
                  src={getMediaUrl(coverPreview || user?.coverPhoto)}
                  alt="Cover preview"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-sm">No cover photo set</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[15px] font-bold text-[#050505]">Profile Picture</label>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-[14px] font-semibold text-[#1877F2] hover:bg-[#EBF3FE] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="relative">
                <Avatar
                  src={avatarPreview || user?.avatar}
                  name={user?.fullName || user?.username}
                  size="xl"
                  className="ring-2 ring-white shadow-md rounded-full !w-20 !h-20"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] border-2 border-white shadow text-[#050505]"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-bold text-[#050505] text-[15px]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[#65676B]">JPG, PNG or GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Tell friends about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={500}
            />
            <span className="text-xs text-gray-400 block text-right">
              {formData.bio.length}/500
            </span>
          </div>

          <Input
            label="Location"
            type="text"
            placeholder="e.g. San Francisco, CA"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <Input
            label="Website"
            type="url"
            placeholder="https://yourwebsite.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/profile/${user?.username}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
