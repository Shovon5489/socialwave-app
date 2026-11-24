import { useState, useRef, useEffect } from 'react';
import { Globe, Users, Lock, MapPin, Tag, ChevronDown, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postAPI } from '../utils/api';
import Avatar from './ui/Avatar';
import Modal from './ui/Modal';
import Button from './ui/Button';
import MediaUpload from './ui/MediaUpload';
import toast from 'react-hot-toast';

const privacyOptions = [
  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can see' },
  { value: 'friends', label: 'Friends', icon: Users, desc: 'Your friends only' },
  { value: 'private', label: 'Only Me', icon: Lock, desc: 'Only you can see' },
];

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [location, setLocation] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const MAX_CHARS = 5000;

  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  // Auto-resize textarea
  const handleTextChange = (e) => {
    setContent(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please write something or add media');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('privacy', privacy);
        if (location) formData.append('location', location);
        mediaFiles.forEach((file) => formData.append('media', file));
        res = await postAPI.createPostWithMedia(formData);
      } else {
        res = await postAPI.createPost({
          content: content.trim(),
          privacy,
          location: location || undefined,
        });
      }
      toast.success('Post created!');
      onPostCreated?.(res.data.post);
      setContent('');
      setMediaFiles([]);
      setLocation('');
      setShowLocation(false);
      setShowMedia(false);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const selectedPrivacy = privacyOptions.find((p) => p.value === privacy) || privacyOptions[0];
  const PrivacyIcon = selectedPrivacy.icon;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = (content.trim() || mediaFiles.length > 0) && !isOverLimit;

  return (
    <>
      {/* Trigger Card */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="md"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left bg-background hover:bg-gray-200 rounded-full px-4 py-2.5 text-sm text-muted transition-colors"
          >
            What's on your mind, {user?.firstName}?
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => { setShowMedia(true); setIsModalOpen(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-green-500" />
            <span className="hidden sm:block">Photo/Video</span>
          </button>
          <button
            onClick={() => { setShowLocation(true); setIsModalOpen(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-5 w-5 text-red-500" />
            <span className="hidden sm:block">Check In</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            <Tag className="h-5 w-5 text-blue-500" />
            <span className="hidden sm:block">Tag Friends</span>
          </button>
        </div>
      </div>

      {/* Full Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); }}
        title="Create Post"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {/* Quick actions */}
              <button
                type="button"
                onClick={() => setShowMedia(!showMedia)}
                className={`p-2 rounded-lg transition-colors ${showMedia ? 'bg-green-50 text-green-600' : 'text-muted hover:bg-gray-100'}`}
                title="Add Photo/Video"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowLocation(!showLocation)}
                className={`p-2 rounded-lg transition-colors ${showLocation ? 'bg-red-50 text-red-500' : 'text-muted hover:bg-gray-100'}`}
                title="Add Location"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <span className={`text-xs font-medium ${isOverLimit ? 'text-red-500' : charCount > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-muted'}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              )}
              <Button onClick={handleSubmit} loading={loading} disabled={!canPost}>
                Post
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* User info + privacy */}
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="md"
            />
            <div>
              <p className="font-semibold text-dark text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              {/* Privacy Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowPrivacy(!showPrivacy)}
                  className="flex items-center gap-1 text-xs font-medium text-dark bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-0.5 mt-0.5 transition-colors"
                >
                  <PrivacyIcon className="h-3 w-3" />
                  {selectedPrivacy.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showPrivacy && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-fade-in">
                    {privacyOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setPrivacy(opt.value); setShowPrivacy(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            privacy === opt.value ? 'text-primary bg-primary-50' : 'text-dark hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-medium text-xs">{opt.label}</p>
                            <p className="text-xs text-muted">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder={`What's on your mind, ${user?.firstName}?`}
            className="w-full text-dark text-base placeholder:text-muted resize-none focus:outline-none min-h-[100px]"
            style={{ overflow: 'hidden' }}
          />

          {/* Location Input */}
          {showLocation && (
            <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2">
              <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location..."
                className="flex-1 bg-transparent text-sm text-dark placeholder:text-muted focus:outline-none"
              />
              <button onClick={() => { setShowLocation(false); setLocation(''); }}>
                <X className="h-4 w-4 text-muted hover:text-dark" />
              </button>
            </div>
          )}

          {/* Media Upload */}
          {showMedia && (
            <MediaUpload
              files={mediaFiles}
              onChange={setMediaFiles}
              maxFiles={10}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
