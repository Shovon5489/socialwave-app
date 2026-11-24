import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/PostCard';
import Loader from '../components/ui/Loader';
import { postAPI } from '../utils/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SinglePostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postAPI.getPost(id);
        const postData = res.data?.data?.post || res.data?.post;
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        toast.error('Post not found or deleted');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  return (
    <MainLayout hideSidebars>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">Post</span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : !post ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">Post Unavailable</h2>
            <p className="text-sm text-gray-500 mt-1">
              This post may have been removed or you do not have permission to view it.
            </p>
            <Link to="/feed" className="mt-4 inline-block text-primary text-sm font-semibold hover:underline">
              Go back to Feed
            </Link>
          </div>
        ) : (
          <PostCard
            post={post}
            onDelete={() => navigate('/feed')}
            onUpdate={(updated) => setPost(updated)}
          />
        )}
      </div>
    </MainLayout>
  );
}
