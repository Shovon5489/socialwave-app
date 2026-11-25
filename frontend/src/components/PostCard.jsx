import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock,
  Pencil, Trash2, Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
  Send, ThumbsUp, Reply,
} from 'lucide-react';
import { formatRelativeTime, parseHashtags, getMediaUrl, formatNumber } from '../utils/helpers';
import { postAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Avatar from './ui/Avatar';
import Modal from './ui/Modal';
import Button from './ui/Button';
import EmojiPicker from './ui/EmojiPicker';
import toast from 'react-hot-toast';

function PrivacyIcon({ privacy }) {
  if (privacy === 'public') return <Globe className="h-3 w-3" />;
  if (privacy === 'friends') return <Users className="h-3 w-3" />;
  return <Lock className="h-3 w-3" />;
}

function MediaGrid({ media }) {
  const [failedIndices, setFailedIndices] = useState(new Set());
  if (!media || media.length === 0) return null;

  const handleMediaError = (idx) => {
    setFailedIndices((prev) => new Set([...prev, idx]));
  };

  const validMedia = media
    .map((m, idx) => ({ url: getMediaUrl(m.url || m), type: m.type || 'image', idx }))
    .filter((m) => !failedIndices.has(m.idx));

  if (validMedia.length === 0) return null;

  if (validMedia.length === 1) {
    const item = validMedia[0];
    return (
      <div className="rounded-xl overflow-hidden mt-3 bg-gray-100 border border-gray-200">
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls
            onError={() => handleMediaError(item.idx)}
            className="w-full max-h-[480px] object-cover"
          />
        ) : (
          <img
            src={item.url}
            alt="post media"
            onError={() => handleMediaError(item.idx)}
            className="w-full max-h-[480px] object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`grid gap-1 mt-3 rounded-xl overflow-hidden ${validMedia.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {validMedia.slice(0, 4).map((m, i) => (
        <div key={i} className="relative bg-gray-100">
          <img
            src={m.url}
            alt=""
            onError={() => handleMediaError(m.idx)}
            className="w-full h-48 object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function TextContent({ text, maxChars = 300 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const shouldTruncate = text.length > maxChars;
  const displayText = shouldTruncate && !expanded ? text.slice(0, maxChars) : text;
  const segments = parseHashtags(displayText);

  return (
    <div className="mt-2 text-sm text-dark leading-relaxed">
      {segments.map((seg, i) =>
        seg.isHashtag ? (
          <Link
            key={i}
            to={`/search?q=${encodeURIComponent(seg.text)}`}
            className="text-primary hover:underline"
          >
            {seg.text}
          </Link>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
      {shouldTruncate && !expanded && <span className="text-muted">...</span>}
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-muted text-xs font-medium hover:text-dark"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
}

function CommentItem({ comment, postId, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const replyInputRef = useRef(null);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      await postAPI.likeComment(postId, comment._id);
    } catch {
      setLiked(liked);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await postAPI.addReply(postId, comment._id, replyText.trim());
      setReplies((prev) => [...prev, res.data.reply]);
      setReplyText('');
      setShowReplies(true);
    } catch {
      toast.error('Failed to add reply');
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar
        src={comment.author?.avatar}
        name={`${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`}
        size="xs"
      />
      <div className="flex-1">
        <div className="bg-background rounded-2xl px-3 py-2">
          <Link
            to={`/profile/${comment.author?.username}`}
            className="text-xs font-semibold text-dark hover:underline"
          >
            {comment.author?.firstName} {comment.author?.lastName}
          </Link>
          <p className="text-sm text-dark mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 px-2 mt-1">
          <button
            onClick={handleLike}
            className={`text-xs font-medium transition-colors ${liked ? 'text-primary' : 'text-muted hover:text-primary'}`}
          >
            Like
          </button>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs font-medium text-muted hover:text-dark transition-colors"
          >
            Reply
          </button>
          <span className="text-xs text-muted">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        {/* Reply input */}
        {showReplies && (
          <div className="mt-2 ml-2">
            <form onSubmit={handleReply} className="flex gap-2 items-center">
              <Avatar src={user?.avatar} name={`${user?.firstName || ''} ${user?.lastName || ''}`} size="xs" />
              <div className="flex-1 relative flex items-center gap-1">
                <input
                  ref={replyInputRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-background rounded-full pl-3 pr-10 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                {/* Emoji picker for reply */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <EmojiPicker
                    size="sm"
                    position="top-right"
                    onEmojiSelect={(emoji) => setReplyText((prev) => prev + emoji)}
                    buttonClassName="p-0.5 rounded-full text-amber-400 hover:bg-amber-50 transition-colors"
                  />
                </div>
              </div>
              {replyText.trim() && (
                <button type="submit" className="text-primary">
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
            {/* Replies list */}
            {replies.map((reply) => (
              <div key={reply._id} className="flex gap-2 mt-2">
                <Avatar
                  src={reply.author?.avatar}
                  name={`${reply.author?.firstName || ''} ${reply.author?.lastName || ''}`}
                  size="xs"
                />
                <div className="bg-background rounded-2xl px-3 py-2 flex-1">
                  <Link
                    to={`/profile/${reply.author?.username}`}
                    className="text-xs font-semibold text-dark hover:underline"
                  >
                    {reply.author?.firstName} {reply.author?.lastName}
                  </Link>
                  <p className="text-xs text-dark mt-0.5">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostCard({ post: initialPost, onDelete, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [saved, setSaved] = useState(post.saved || false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareText, setShareText] = useState('');
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const isOwner = user?._id === (post.author?._id || post.author);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) await postAPI.unlikePost(post._id);
      else await postAPI.likePost(post._id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleSave = async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      if (wasSaved) await postAPI.unsavePost(post._id);
      else await postAPI.savePost(post._id);
      toast.success(wasSaved ? 'Post unsaved' : 'Post saved');
    } catch {
      setSaved(wasSaved);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await postAPI.addComment(post._id, commentText.trim());
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText('');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postAPI.deletePost(post._id);
      onDelete?.(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      await postAPI.sharePost(post._id, shareText);
      toast.success('Post shared!');
      setShareModalOpen(false);
      setShareText('');
    } catch {
      toast.error('Failed to share post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <Avatar
            src={post.author?.avatar}
            name={`${post.author?.firstName || ''} ${post.author?.lastName || ''}`}
            size="md"
            onClick={() => navigate(`/profile/${post.author?.username}`)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-semibold text-sm text-dark hover:underline"
              >
                {post.author?.firstName} {post.author?.lastName}
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span title={formatRelativeTime(post.createdAt)}>
                {formatRelativeTime(post.createdAt)}
              </span>
              <span>·</span>
              <PrivacyIcon privacy={post.privacy} />
              {post.isEdited && <><span>·</span><span className="italic">Edited</span></>}
            </div>
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full text-muted hover:bg-gray-100 hover:text-dark transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fade-in">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-gray-50"
                >
                  {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? 'Unsave Post' : 'Save Post'}
                </button>
                {isOwner && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); onUpdate?.(post); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4">
          <TextContent text={post.content} />
          {post.location && (
            <p className="text-xs text-muted mt-1">📍 {post.location}</p>
          )}
        </div>

        {/* Media */}
        <div className="px-4">
          <MediaGrid media={post.media} />
        </div>

        {/* Stats */}
        {(likeCount > 0 || comments.length > 0 || (post.shares?.length || 0) > 0) && (
          <div className="flex items-center justify-between px-4 py-2 mt-2 text-xs text-[#65676B] border-t border-gray-100">
            <button className="flex items-center gap-1.5 hover:underline" onClick={() => setCommentsOpen(!commentsOpen)}>
              {likeCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center -space-x-1">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[11px] shadow-sm">
                      👍
                    </span>
                    <span className="w-5 h-5 rounded-full bg-[#FA383E] flex items-center justify-center text-white text-[11px] shadow-sm">
                      ❤️
                    </span>
                  </div>
                  <span className="text-[13px] font-normal text-[#65676B]">{formatNumber(likeCount)}</span>
                </div>
              )}
            </button>
            <div className="flex items-center gap-3">
              {comments.length > 0 && (
                <button onClick={() => setCommentsOpen(!commentsOpen)} className="hover:underline text-[13px] text-[#65676B]">
                  {formatNumber(comments.length)} comment{comments.length !== 1 ? 's' : ''}
                </button>
              )}
              {(post.shares?.length || 0) > 0 && (
                <span className="text-[13px] text-[#65676B]">{formatNumber(post.shares.length)} share{post.shares.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Bar (Facebook Like, Comment, Share) */}
        <div className="flex items-center border-t border-[#CED0D4]/60 mx-3 py-1">
          <button
            onClick={handleLike}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 text-[14px] font-semibold rounded-lg transition-colors
              ${liked ? 'text-[#1877F2]' : 'text-[#65676B] hover:bg-[#F2F2F2]'}
            `}
          >
            <ThumbsUp
              className={`h-5 w-5 transition-transform ${likeAnimating ? 'animate-like-pulse' : ''} ${liked ? 'fill-[#1877F2]' : ''}`}
            />
            <span>Like</span>
          </button>
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-[14px] font-semibold text-[#65676B] hover:bg-[#F2F2F2] rounded-lg transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Comment</span>
          </button>
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-[14px] font-semibold text-[#65676B] hover:bg-[#F2F2F2] rounded-lg transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {commentsOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
            {/* Comment Input */}
            <form onSubmit={handleComment} className="flex items-center gap-2">
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                size="sm"
              />
              <div className="flex-1 relative flex items-center">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white rounded-full pl-4 pr-20 py-2 text-[14px] text-[#050505] placeholder-[#65676B] border border-transparent focus:border-gray-300 outline-none transition-all"
                />
                {/* Emoji & Send buttons inside the input */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <EmojiPicker
                    size="sm"
                    position="top-right"
                    onEmojiSelect={(emoji) => setCommentText((prev) => prev + emoji)}
                    buttonClassName="p-1 rounded-full text-amber-400 hover:bg-amber-50 transition-colors"
                  />
                  {commentText.trim() && (
                    <button
                      type="submit"
                      className="p-1 text-[#1877F2] hover:opacity-80"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-xs text-muted text-center py-2">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                />
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Post"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShareModalOpen(false)}>Cancel</Button>
            <Button onClick={handleShare} loading={loading}>Share Now</Button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            placeholder="Say something about this post..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          {/* Post preview mini */}
          <div className="border border-gray-200 rounded-xl p-3 bg-background">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.author?.avatar}
                name={`${post.author?.firstName || ''} ${post.author?.lastName || ''}`}
                size="xs"
              />
              <span className="text-xs font-medium text-dark">
                {post.author?.firstName} {post.author?.lastName}
              </span>
            </div>
            <p className="text-xs text-muted line-clamp-2">{post.content}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
