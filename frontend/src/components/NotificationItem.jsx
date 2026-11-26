import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, UserPlus, Share2, AtSign } from 'lucide-react';
import Avatar from './ui/Avatar';
import { formatRelativeTime } from '../utils/helpers';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function NotificationItem({ notification, onRead }) {
  const { _id, sender, type, post, isRead, createdAt, message } = notification;
  const [reqState, setReqState] = useState('idle'); // idle | accepted | declined
  const [actionLoading, setActionLoading] = useState(false);

  const senderId = sender?._id || sender?.id;

  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!senderId || actionLoading) return;
    try {
      setActionLoading(true);
      await userAPI.acceptFriendRequest(senderId);
      setReqState('accepted');
      if (!isRead && onRead) onRead(_id);
      toast.success(`You and ${sender?.firstName || sender?.fullName || 'User'} are now friends!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!senderId || actionLoading) return;
    try {
      setActionLoading(true);
      await userAPI.declineFriendRequest(senderId);
      setReqState('declined');
      if (!isRead && onRead) onRead(_id);
      toast.success('Friend request deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />;
      case 'friend_request':
      case 'friend_accepted':
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-green-500" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTargetLink = () => {
    if (post) return `/post/${post._id || post}`;
    if (sender) return `/profile/${sender.username}`;
    return '#';
  };

  return (
    <Link
      to={getTargetLink()}
      onClick={() => !isRead && onRead && onRead(_id)}
      className={`flex items-start gap-3 p-3.5 rounded-xl transition-colors hover:bg-gray-50 ${
        !isRead ? 'bg-blue-50/60 font-medium' : 'bg-white'
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={sender?.avatar} name={sender?.fullName || sender?.username || 'User'} size="md" />
        <span className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
          {getIcon()}
        </span>
      </div>

      <div className="flex-1 min-w-0 text-sm">
        <p className="text-gray-900 leading-snug">
          <span className="font-semibold hover:underline">
            {sender?.fullName || sender?.username || 'Someone'}
          </span>{' '}
          {message || 'interacted with your profile or post'}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          {formatRelativeTime(createdAt)}
        </span>

        {type === 'friend_request' && senderId && (
          <div className="mt-2.5 flex items-center gap-2">
            {reqState === 'idle' ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Delete
                </button>
              </>
            ) : reqState === 'accepted' ? (
              <span className="text-xs font-semibold text-green-600">Friend request accepted ✓</span>
            ) : (
              <span className="text-xs font-medium text-gray-500">Request removed</span>
            )}
          </div>
        )}
      </div>

      {!isRead && (
        <span className="w-2.5 h-2.5 rounded-full bg-primary self-center flex-shrink-0" />
      )}
    </Link>
  );
}
