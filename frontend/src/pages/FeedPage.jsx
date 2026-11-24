import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import StoryBar from '../components/StoryBar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Loader from '../components/ui/Loader';
import { postAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await postAPI.getFeed(pageNum);
      const newPosts = res.data?.data?.posts || res.data?.posts || [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length >= 10);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching feed:', err);
      toast.error('Could not load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* 24-hr Stories */}
        <StoryBar />

        {/* Create Post Card */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Post Feed */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="text-4xl mb-3">👋</div>
            <h3 className="text-lg font-semibold text-gray-800">Your feed is waiting!</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              Connect with friends, follow people, or create your first post to start seeing content here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={() => fetchFeed(page + 1)}
                  disabled={loadingMore}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors"
                >
                  {loadingMore ? 'Loading more posts...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
