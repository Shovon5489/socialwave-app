import { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { postAPI } from '../utils/api';
import Avatar from './ui/Avatar';
import { getMediaUrl } from '../utils/helpers';

// Mock stories data for demo
const MOCK_STORIES = [
  {
    _id: 's1',
    author: { _id: 'u1', firstName: 'Alice', lastName: 'Johnson', username: 'alicej' },
    media: null,
    backgroundColor: '#1877F2',
    text: 'Living my best life! 🌟',
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 's2',
    author: { _id: 'u2', firstName: 'Bob', lastName: 'Smith', username: 'bobsmith' },
    media: null,
    backgroundColor: '#E91E63',
    text: 'Weekend vibes ✌️',
    expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 's3',
    author: { _id: 'u3', firstName: 'Sofia', lastName: 'Lee', username: 'sofialee' },
    media: null,
    backgroundColor: '#42B72A',
    text: 'Nature walks 🌿',
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  },
];

function StoryViewerModal({ stories, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 5000; // 5s per story

  const story = stories[currentIndex];

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
    return () => clearInterval(intervalRef.current);
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };
  const handleNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/30"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-sm h-screen max-h-[600px] rounded-2xl overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Author */}
        <div className="absolute top-8 left-3 flex items-center gap-2 z-10">
          <Avatar
            src={story.author?.avatar}
            name={`${story.author?.firstName || ''} ${story.author?.lastName || ''}`}
            size="sm"
            ring
            ringColor="ring-white"
          />
          <div>
            <p className="text-white text-sm font-semibold">
              {story.author?.firstName} {story.author?.lastName}
            </p>
          </div>
        </div>

        {/* Story Content */}
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{ backgroundColor: story.backgroundColor || '#1877F2' }}
        >
          {story.media ? (
            story.mediaType === 'video' ? (
              <video
                src={getMediaUrl(story.media)}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop={false}
              />
            ) : (
              <img
                src={getMediaUrl(story.media)}
                alt="Story"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <p className="text-white text-2xl font-bold text-center px-8">{story.text}</p>
          )}
        </div>

        {/* Navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function StoryCard({ story, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-24 h-40 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
      style={{ backgroundColor: story.backgroundColor || '#1877F2' }}
    >
      {story.media ? (
        <img
          src={getMediaUrl(story.media)}
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <p className="text-white text-xs font-medium text-center px-2 line-clamp-3">{story.text}</p>
        </div>
      )}
      {/* Avatar */}
      <div className="absolute top-2 left-2">
        <Avatar
          src={story.author?.avatar}
          name={`${story.author?.firstName || ''} ${story.author?.lastName || ''}`}
          size="sm"
          ring
          ringColor="ring-primary"
        />
      </div>
      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs font-medium text-center truncate">
          {story.author?.firstName}
        </p>
      </div>
    </button>
  );
}

export default function StoryBar() {
  const { user } = useAuth();
  const [stories, setStories] = useState(MOCK_STORIES);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleViewStory = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto story-scroll pb-1">
        {/* Create Story Card */}
        <button className="relative flex-shrink-0 w-24 h-40 rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200 group">
          <div className="h-2/3 bg-background flex items-center justify-center">
            <Avatar
              src={user?.avatar}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="lg"
            />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-0 mt-[-8px]">
            <div className="h-7 w-7 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="h-1/3 flex items-end justify-center pb-2 pt-4">
            <p className="text-xs font-semibold text-dark text-center leading-tight">
              Create Story
            </p>
          </div>
        </button>

        {/* Story Cards */}
        {stories.map((story, index) => (
          <StoryCard
            key={story._id}
            story={story}
            onClick={() => handleViewStory(index)}
          />
        ))}
      </div>

      {/* Story Viewer */}
      {viewerOpen && (
        <StoryViewerModal
          stories={stories}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
