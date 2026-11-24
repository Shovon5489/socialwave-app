import { Link } from 'react-router-dom';
import { Heart, MessageSquare, UserPlus, Share2, AtSign } from 'lucide-react';
import Avatar from './ui/Avatar';
import { formatRelativeTime } from '../utils/helpers';

export default function NotificationItem({ notification, onRead }) {
  const { _id, sender, type, post, isRead, createdAt, message } = notification;

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
      </div>

      {!isRead && (
        <span className="w-2.5 h-2.5 rounded-full bg-primary self-center flex-shrink-0" />
      )}
    </Link>
  );
}
