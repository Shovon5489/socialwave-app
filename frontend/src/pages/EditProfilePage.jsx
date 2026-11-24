import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../utils/api';
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
        <div className="space-y-4 mb-8">
          <label className="block text-sm font-semibold text-gray-700">Profile Media</label>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative">
              <Avatar
                src={avatarPreview || user?.avatar}
                name={user?.fullName || user?.username}
                size="xl"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Camera}
                onClick={() => avatarInputRef.current?.click()}
              >
                Change Profile Photo
              </Button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={ImageIcon}
                onClick={() => coverInputRef.current?.click()}
              >
                Change Cover Photo
              </Button>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverChange}
                accept="image/*"
                className="hidden"
              />
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
