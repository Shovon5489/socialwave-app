import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/PostCard';
import Loader from '../components/ui/Loader';
import { postAPI } from '../utils/api';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const res = await postAPI.getSavedPosts();
      const savedItems = res.data?.data?.posts || res.data?.posts || [];
      setPosts(savedItems);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      toast.error('Could not load saved posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handlePostDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  const handlePostUpdated = (updated) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  return (
    <MainLayout hideSidebars>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Posts</h1>
            <p className="text-xs text-gray-500">Only you can see the posts you've saved</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">No saved posts</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Save posts to read later by clicking the bookmark icon on any post in your feed.
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
          </div>
        )}
      </div>
    </MainLayout>
  );
}
