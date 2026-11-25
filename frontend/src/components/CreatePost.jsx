import { useState, useRef, useEffect } from 'react';
import {
  Globe, Users, Lock, MapPin, Tag, ChevronDown, X,
  Image as ImageIcon, Video, Smile,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postAPI } from '../utils/api';
import Avatar from './ui/Avatar';
import Modal from './ui/Modal';
import MediaUpload from './ui/MediaUpload';
import toast from 'react-hot-toast';

const privacyOptions = [
  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone on or off SocialWave' },
  { value: 'friends', label: 'Friends', icon: Users, desc: 'Your friends on SocialWave' },
  { value: 'private', label: 'Only me', icon: Lock, desc: 'Only you can see this' },
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

      const createdPost = res.data?.data?.post || res.data?.post;
      if (createdPost) {
        onPostCreated?.(createdPost);
      }
      toast.success('Post published!');
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
      {/* Facebook Trigger Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="md"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left bg-[#F0F2F5] hover:bg-[#E4E6EB] rounded-full px-4 py-2.5 text-[15px] text-[#65676B] transition-colors"
          >
            What's on your mind, {user?.firstName}?
          </button>
        </div>

        {/* Facebook 3 Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E4E6EB]">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[#F2F2F2] transition-colors"
          >
            <Video className="h-6 w-6 text-[#F3425F]" />
            <span className="text-[14px] font-semibold text-[#65676B] hidden sm:inline">Live video</span>
          </button>

          <button
            onClick={() => { setShowMedia(true); setIsModalOpen(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[#F2F2F2] transition-colors"
          >
            <ImageIcon className="h-6 w-6 text-[#45BD62]" />
            <span className="text-[14px] font-semibold text-[#65676B] hidden sm:inline">Photo/video</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[#F2F2F2] transition-colors"
          >
            <Smile className="h-6 w-6 text-[#F7B125]" />
            <span className="text-[14px] font-semibold text-[#65676B] hidden sm:inline">Feeling/activity</span>
          </button>
        </div>
      </div>

      {/* Facebook Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); }}
        title="Create post"
        size="lg"
      >
        <div className="space-y-4">
          {/* User info row */}
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="md"
            />
            <div>
              <p className="font-semibold text-[#050505] text-[15px] leading-snug">
                {user?.firstName} {user?.lastName}
              </p>
              {/* Privacy Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPrivacy(!showPrivacy)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-[#050505] bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-md px-2 py-0.5 mt-0.5 transition-colors"
                >
                  <PrivacyIcon className="h-3 w-3 text-[#050505]" />
                  <span>{selectedPrivacy.label}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showPrivacy && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 animate-fade-in">
                    {privacyOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setPrivacy(opt.value); setShowPrivacy(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                            privacy === opt.value ? 'bg-[#EBF3FE] text-[#1877F2]' : 'hover:bg-[#F2F2F2] text-[#050505]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-[14px]">{opt.label}</p>
                            <p className="text-xs text-[#65676B]">{opt.desc}</p>
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
            className="w-full text-[#050505] text-[17px] placeholder-[#65676B] resize-none focus:outline-none min-h-[110px] leading-relaxed border-none p-0"
            style={{ overflow: 'hidden' }}
          />

          {/* Location Input */}
          {showLocation && (
            <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-xl px-3 py-2 border border-gray-200">
              <MapPin className="h-4 w-4 text-[#F3425F] flex-shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you?"
                className="flex-1 bg-transparent text-sm text-[#050505] placeholder-[#65676B] focus:outline-none"
              />
              <button type="button" onClick={() => { setShowLocation(false); setLocation(''); }}>
                <X className="h-4 w-4 text-[#65676B] hover:text-[#050505]" />
              </button>
            </div>
          )}

          {/* Media Upload */}
          {showMedia && (
            <div className="border border-dashed border-gray-300 rounded-xl p-2 bg-gray-50/50">
              <MediaUpload
                files={mediaFiles}
                onChange={setMediaFiles}
                maxFiles={10}
              />
            </div>
          )}

          {/* Facebook 'Add to your post' Toolbar */}
          <div className="flex items-center justify-between border border-[#CED0D4] rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-[14px] font-semibold text-[#050505]">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowMedia(!showMedia)}
                className={`p-2 rounded-full hover:bg-[#F2F2F2] transition-colors ${showMedia ? 'bg-green-50' : ''}`}
                title="Photo/video"
              >
                <ImageIcon className="h-6 w-6 text-[#45BD62]" />
              </button>
              <button
                type="button"
                onClick={() => setShowLocation(!showLocation)}
                className={`p-2 rounded-full hover:bg-[#F2F2F2] transition-colors ${showLocation ? 'bg-red-50' : ''}`}
                title="Add location"
              >
                <MapPin className="h-6 w-6 text-[#F3425F]" />
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="p-2 rounded-full hover:bg-[#F2F2F2] transition-colors"
                title="Tag people"
              >
                <Tag className="h-6 w-6 text-[#1877F2]" />
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="p-2 rounded-full hover:bg-[#F2F2F2] transition-colors"
                title="Feeling/activity"
              >
                <Smile className="h-6 w-6 text-[#F7B125]" />
              </button>
            </div>
          </div>

          {/* Post Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canPost || loading}
            className="w-full py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Post'
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}
