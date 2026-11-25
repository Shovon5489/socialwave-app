import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, X, ChevronLeft, ChevronRight,
  Image as ImageIcon, Type, Trash2, Upload, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { storyAPI } from '../utils/api';
import Avatar from './ui/Avatar';
import { getMediaUrl, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

// Curated Facebook-style vibrant story backgrounds
const BACKGROUND_PRESETS = [
  { id: 'fb-blue', name: 'Facebook Blue', value: '#1877F2' },
  { id: 'gradient-sunset', name: 'Sunset Glow', value: 'linear-gradient(135deg, #FF512F, #DD2476)' },
  { id: 'gradient-ocean', name: 'Ocean Wave', value: 'linear-gradient(135deg, #00c6ff, #0072ff)' },
  { id: 'gradient-purple', name: 'Neon Purple', value: 'linear-gradient(135deg, #8A2387, #E94057, #F27121)' },
  { id: 'gradient-emerald', name: 'Emerald', value: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'gradient-dark', name: 'Midnight', value: 'linear-gradient(135deg, #232526, #414345)' },
  { id: 'vibrant-pink', name: 'Hot Pink', value: '#E91E63' },
  { id: 'vibrant-green', name: 'Vibrant Green', value: '#42B72A' },
];

// Fallback initial demo stories
const DEFAULT_STORIES = [
  {
    _id: 'mock-1',
    author: { firstName: 'Alice', lastName: 'Johnson', username: 'alicej' },
    media: null,
    backgroundColor: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    text: 'Living my best life! 🌟🌊',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    author: { firstName: 'Bob', lastName: 'Smith', username: 'bobsmith' },
    media: null,
    backgroundColor: '#E91E63',
    text: 'Weekend vibes & coffee ☕✌️',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-3',
    author: { firstName: 'Sofia', lastName: 'Lee', username: 'sofialee' },
    media: null,
    backgroundColor: 'linear-gradient(135deg, #11998e, #38ef7d)',
    text: 'Nature walks & peace 🌿✨',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Facebook-style Create Story Modal
 */
function CreateStoryModal({ isOpen, onClose, onStoryCreated, initialFile, initialPreview }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('photo'); // 'photo' | 'text'
  const [text, setText] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PRESETS[0].value);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with direct file selection from gallery
  useEffect(() => {
    if (isOpen) {
      if (initialFile && initialPreview) {
        setMediaFile(initialFile);
        setMediaPreview(initialPreview);
        setMode('photo');
      }
    } else {
      setMode('photo');
      setText('');
      setMediaFile(null);
      setMediaPreview(null);
      setLoading(false);
    }
  }, [isOpen, initialFile, initialPreview]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'photo' && !mediaFile) {
      toast.error('Please choose a photo or video from your gallery');
      return;
    }

    if (mode === 'text' && (!text || text.trim() === '')) {
      toast.error('Please write something in your story');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sharing your story...');

    try {
      // Convert image to base64 data URL for permanent display
      let mediaBase64 = null;
      if (mediaFile && mediaFile.type.startsWith('image/')) {
        try {
          mediaBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(mediaFile);
          });
        } catch (_) {}
      }

      const formData = new FormData();
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      formData.append('text', text.trim());
      formData.append('backgroundColor', selectedBg);

      let serverStory = null;
      try {
        const res = await storyAPI.createStory(formData);
        serverStory = res.data?.data?.story || res.data?.story;
      } catch (apiErr) {
        console.warn('Server story API warning, using persistent local store:', apiErr);
      }

      const finalStory = serverStory || {
        _id: 'story-' + Date.now(),
        author: {
          _id: user?._id || user?.id,
          firstName: user?.firstName || 'You',
          lastName: user?.lastName || '',
          username: user?.username || 'user',
          avatar: user?.avatar,
        },
        media: mediaBase64 || mediaPreview,
        mediaType: mediaFile?.type.startsWith('video/') ? 'video' : 'image',
        text: text.trim(),
        backgroundColor: selectedBg,
        createdAt: new Date().toISOString(),
      };

      if (onStoryCreated) {
        onStoryCreated(finalStory);
      }

      // Persist user stories in localStorage as well
      try {
        const savedStories = JSON.parse(localStorage.getItem('socialwave_user_stories') || '[]');
        savedStories.unshift(finalStory);
        localStorage.setItem('socialwave_user_stories', JSON.stringify(savedStories.slice(0, 10)));
      } catch (_) {}

      toast.success('Story published successfully! 🎉', { id: toastId });
      onClose();
    } catch (err) {
      console.error('Story upload failed:', err);
      toast.error('Could not share story. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1877F2]" />
            <h2 className="text-lg font-bold text-[#050505]">Create Story</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Type Selector Tabs */}
        <div className="grid grid-cols-2 p-2 bg-[#F0F2F5] border-b border-gray-200">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'photo'
                ? 'bg-white text-[#1877F2] shadow-sm'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo / Video Story</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'text'
                ? 'bg-white text-[#1877F2] shadow-sm'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text Story</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Live Preview Card */}
          <div className="flex justify-center">
            <div
              className="relative w-44 sm:w-48 h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center text-center p-4 transition-all"
              style={{
                background: mode === 'photo' && mediaPreview ? '#000' : selectedBg,
              }}
            >
              {mode === 'photo' && mediaPreview ? (
                mediaFile?.type.startsWith('video/') ? (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                )
              ) : (
                <p className="text-white text-base sm:text-lg font-bold leading-relaxed break-words px-2 max-h-48 overflow-hidden drop-shadow-md">
                  {text || 'Start typing your story...'}
                </p>
              )}

              {/* User Avatar badge preview */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <Avatar
                  src={user?.avatar}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  size="sm"
                  className="ring-2 ring-white shadow-sm"
                />
              </div>

              {/* Caption overlay for Photo Story */}
              {mode === 'photo' && text && (
                <div className="absolute bottom-3 left-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white text-xs font-medium text-center line-clamp-2 z-10">
                  {text}
                </div>
              )}
            </div>
          </div>

          {/* Mode-specific Controls */}
          {mode === 'photo' ? (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-[#1877F2] hover:bg-blue-50/50 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-[#1877F2] transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-[#050505]">
                  {mediaFile ? `Selected: ${mediaFile.name} (Click to change)` : 'Open Gallery to choose Photo or Video'}
                </span>
                <span className="text-xs text-[#65676B]">PNG, JPG, MP4 or WEBM up to 50MB</span>
              </button>

              <div>
                <label className="text-xs font-bold text-[#65676B] uppercase mb-1 block">
                  Add a caption (optional)
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#65676B] uppercase mb-1 block">
                  Story Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type something to share..."
                  rows={3}
                  maxLength={280}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1877F2] text-sm resize-none"
                />
                <span className="text-xs text-[#65676B] text-right block mt-1">
                  {text.length}/280
                </span>
              </div>

              {/* Background Color Picker */}
              <div>
                <label className="text-xs font-bold text-[#65676B] uppercase mb-2 block">
                  Background Style
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBg(bg.value)}
                      className={`w-9 h-9 rounded-full flex-shrink-0 transition-all flex items-center justify-center shadow-sm ${
                        selectedBg === bg.value
                          ? 'ring-4 ring-offset-2 ring-[#1877F2] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ background: bg.value }}
                      title={bg.name}
                    >
                      {selectedBg === bg.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#65676B] hover:bg-gray-200 transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (mode === 'photo' && !mediaFile) || (mode === 'text' && !text.trim())}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <span>Share to Story</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Story Viewer Modal with Progress Bar & Auto-Advance
 */
function StoryViewerModal({ stories, initialIndex, onClose, onDeleteStory }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 5000; // 5s per story

  const story = stories[currentIndex];
  const isAuthor =
    story?.author?._id === user?._id ||
    story?.author?.id === user?._id ||
    story?.author?.username === user?.username;

  useEffect(() => {
    setProgress(0);
    clearInterval(intervalRef.current);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    }, 50);

    // Call view API in background
    if (story?._id && !story._id.startsWith('mock-') && !story._id.startsWith('story-')) {
      storyAPI.viewStory(story._id).catch(() => {});
    }

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, stories.length, onClose, story]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-20 cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-sm h-screen max-h-[640px] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Author Bar */}
        <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={story.author?.avatar}
              name={`${story.author?.firstName || ''} ${story.author?.lastName || ''}`}
              size="sm"
              ring
              ringColor="ring-white"
            />
            <div>
              <p className="text-white text-sm font-bold drop-shadow">
                {story.author?.firstName} {story.author?.lastName}
              </p>
              <p className="text-white/80 text-[11px] drop-shadow">
                {story.createdAt ? formatRelativeTime(story.createdAt) : 'Just now'}
              </p>
            </div>
          </div>

          {/* Delete story button for author */}
          {isAuthor && onDeleteStory && (
            <button
              onClick={() => onDeleteStory(story._id)}
              className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-700 text-white transition-colors shadow cursor-pointer"
              title="Delete this story"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Story Content */}
        <div
          className="w-full h-full flex items-center justify-center relative overflow-hidden"
          style={{ background: story.media ? '#000' : story.backgroundColor || '#1877F2' }}
        >
          {story.media ? (
            story.mediaType === 'video' ? (
              <video
                src={getMediaUrl(story.media)}
                className="w-full h-full object-contain"
                autoPlay
                muted
                loop={false}
              />
            ) : (
              <img
                src={getMediaUrl(story.media)}
                alt="Story"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <p className="text-white text-2xl font-bold text-center px-8 leading-relaxed drop-shadow-lg">
              {story.text}
            </p>
          )}

          {/* Caption over media if provided */}
          {story.media && story.text && (
            <div className="absolute bottom-6 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white text-sm font-semibold text-center drop-shadow-md">
              {story.text}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-20 cursor-pointer"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-20 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Single Story Card on the Story Bar
 */
function StoryCard({ story, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm border border-gray-200 group text-left"
      style={{ background: story.media ? '#000' : story.backgroundColor || '#1877F2' }}
    >
      {story.media ? (
        story.mediaType === 'video' ? (
          <video
            src={getMediaUrl(story.media)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            muted
          />
        ) : (
          <img
            src={getMediaUrl(story.media)}
            alt="Story"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <p className="text-white text-xs sm:text-sm font-semibold text-center leading-snug drop-shadow-sm line-clamp-4">
            {story.text}
          </p>
        </div>
      )}

      {/* Facebook Avatar with blue ring */}
      <div className="absolute top-3 left-3 ring-4 ring-[#1877F2] rounded-full p-0.5 bg-white shadow-md z-10">
        <Avatar
          src={story.author?.avatar}
          name={`${story.author?.firstName || ''} ${story.author?.lastName || ''}`}
          size="sm"
        />
      </div>

      {/* Author Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pt-6 z-10">
        <p className="text-white text-[13px] font-semibold truncate drop-shadow-md">
          {story.author?.firstName} {story.author?.lastName}
        </p>
      </div>
    </button>
  );
}

/**
 * StoryBar Component with Direct Gallery Opening & Story Upload
 */
export default function StoryBar() {
  const { user } = useAuth();
  const [stories, setStories] = useState(DEFAULT_STORIES);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);
  const [pickedPreview, setPickedPreview] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Hidden native file input ref for direct gallery opening
  const directFileInputRef = useRef(null);

  // Load active stories from backend API and local cache
  const loadStories = async () => {
    let localSaved = [];
    try {
      localSaved = JSON.parse(localStorage.getItem('socialwave_user_stories') || '[]');
      const now = Date.now();
      localSaved = localSaved.filter((s) => {
        const created = new Date(s.createdAt).getTime();
        return now - created < 24 * 60 * 60 * 1000;
      });
    } catch (_) {}

    try {
      const res = await storyAPI.getStories();
      const serverStories = res.data?.data?.stories || res.data?.stories || [];
      const combined = [...localSaved];
      for (const ss of serverStories) {
        if (!combined.some((c) => c._id === ss._id)) {
          combined.push(ss);
        }
      }
      for (const ds of DEFAULT_STORIES) {
        if (!combined.some((c) => c._id === ds._id)) {
          combined.push(ds);
        }
      }
      setStories(combined);
    } catch (err) {
      setStories([...localSaved, ...DEFAULT_STORIES]);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Listen for ?createStory=true in URL (e.g. from Profile page "+ Add to story")
  useEffect(() => {
    if (searchParams.get('createStory') === 'true') {
      directFileInputRef.current?.click();
      searchParams.delete('createStory');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // When user clicks "+" or the Create story card: DIRECTLY OPEN GALLERY
  const handleOpenGallery = () => {
    if (directFileInputRef.current) {
      directFileInputRef.current.click();
    }
  };

  // Called immediately when user picks a photo/video from device gallery
  const handleDirectFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setPickedFile(file);
    setPickedPreview(URL.createObjectURL(file));
    setCreateModalOpen(true);
    // Reset so same file can be chosen again
    e.target.value = '';
  };

  const handleViewStory = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleStoryCreated = (newStory) => {
    setStories((prev) => [newStory, ...prev.filter((s) => s._id !== newStory._id)]);
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await storyAPI.deleteStory(storyId);
    } catch (_) {}

    // Also remove from localStorage cache if present
    try {
      const savedStories = JSON.parse(localStorage.getItem('socialwave_user_stories') || '[]');
      const filtered = savedStories.filter((s) => s._id !== storyId);
      localStorage.setItem('socialwave_user_stories', JSON.stringify(filtered));
    } catch (_) {}

    setStories((prev) => prev.filter((s) => s._id !== storyId));
    setViewerOpen(false);
    toast.success('Story deleted');
  };

  return (
    <>
      {/* Hidden file input for direct Gallery / Photo & Video picker */}
      <input
        type="file"
        ref={directFileInputRef}
        onChange={handleDirectFileSelected}
        accept="image/*,video/*"
        className="hidden"
      />

      <div className="flex gap-2.5 overflow-x-auto story-scroll pb-1.5 scrollbar-none">
        {/* Facebook Create Story Card - Clicking opens gallery directly */}
        <div
          onClick={handleOpenGallery}
          className="relative flex-shrink-0 w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 hover:scale-[1.02] transition-transform duration-200 group flex flex-col text-left cursor-pointer select-none"
          title="Click to choose a photo or video from gallery"
        >
          {/* User's Avatar in Top Section */}
          <div className="h-3/4 w-full bg-gradient-to-tr from-blue-100 to-indigo-100 overflow-hidden relative flex items-center justify-center">
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="2xl"
              className="w-full h-full !rounded-none"
            />
            {/* Subtle dark overlay on hover */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow backdrop-blur-xs">
                Open Gallery
              </span>
            </div>
          </div>

          {/* Facebook Blue Plus Button */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[75%] -translate-y-1/2 z-10">
            <div
              className="h-9 w-9 rounded-full bg-[#1877F2] border-[3px] border-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#166FE5] transition-transform"
              title="Add photo or video from gallery"
            >
              <Plus className="h-5 w-5 text-white stroke-[3]" />
            </div>
          </div>

          {/* "Create story" Bottom Text */}
          <div className="h-1/4 w-full flex items-end justify-center pb-2 bg-white">
            <p className="text-[13px] font-semibold text-[#050505] text-center">
              Create story
            </p>
          </div>
        </div>

        {/* Story Cards List */}
        {stories.map((story, index) => (
          <StoryCard
            key={story._id || index}
            story={story}
            onClick={() => handleViewStory(index)}
          />
        ))}
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setPickedFile(null);
          setPickedPreview(null);
        }}
        onStoryCreated={handleStoryCreated}
        initialFile={pickedFile}
        initialPreview={pickedPreview}
      />

      {/* Story Viewer Modal */}
      {viewerOpen && (
        <StoryViewerModal
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          onDeleteStory={handleDeleteStory}
        />
      )}
    </>
  );
}
