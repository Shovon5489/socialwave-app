import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, UserX, Users, MessageCircle } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { userAPI } from '../utils/api';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

export default function FriendCard({ user: person, type = 'suggestion', onAction }) {
  const { openChat } = useChat();
  const [status, setStatus] = useState(type); // suggestion | request | friend | pending
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await userAPI.sendFriendRequest(person._id);
      setStatus('pending');
      toast.success(`Friend request sent to ${person.firstName}!`);
      onAction?.('sent', person._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await userAPI.acceptFriendRequest(person._id);
      setStatus('friend');
      toast.success(`You and ${person.firstName} are now friends!`);
      onAction?.('accepted', person._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await userAPI.declineFriendRequest(person._id);
      setStatus('declined');
      onAction?.('declined', person._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      await userAPI.removeFriend(person._id);
      setStatus('suggestion');
      onAction?.('removed', person._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    try {
      await userAPI.cancelFriendRequest(person._id);
      setStatus('suggestion');
      onAction?.('cancelled', person._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'declined') return null;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
      {/* Avatar / Cover */}
      <div className="relative h-20 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <Avatar
            src={person.avatar}
            name={`${person.firstName || ''} ${person.lastName || ''}`}
            size="lg"
            ring
            ringColor="ring-white"
          />
        </div>
      </div>

      <div className="pt-8 pb-4 px-4 text-center">
        <Link
          to={`/profile/${person.username}`}
          className="font-semibold text-dark hover:text-primary transition-colors block"
        >
          {person.firstName} {person.lastName}
        </Link>
        <p className="text-xs text-muted">@{person.username}</p>
        {person.mutualFriends > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Users className="h-3 w-3 text-muted" />
            <p className="text-xs text-muted">{person.mutualFriends} mutual friend{person.mutualFriends !== 1 ? 's' : ''}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 space-y-2">
          {status === 'suggestion' && (
            <Button
              fullWidth
              size="sm"
              onClick={handleAddFriend}
              loading={loading}
              leftIcon={UserPlus}
            >
              Add Friend
            </Button>
          )}
          {status === 'pending' && (
            <Button
              fullWidth
              size="sm"
              variant="light"
              onClick={handleCancelRequest}
              loading={loading}
            >
              Request Sent
            </Button>
          )}
          {status === 'request' && (
            <div className="flex gap-2">
              <Button
                fullWidth
                size="sm"
                onClick={handleAccept}
                loading={loading}
                leftIcon={UserCheck}
              >
                Confirm
              </Button>
              <Button
                fullWidth
                size="sm"
                variant="light"
                onClick={handleDecline}
                disabled={loading}
                leftIcon={UserX}
              >
                Delete
              </Button>
            </div>
          )}
          {status === 'friend' && (
            <div className="flex gap-2">
              <Button
                fullWidth
                size="sm"
                variant="primary"
                onClick={() => openChat(person)}
                leftIcon={MessageCircle}
              >
                Message
              </Button>
              <Button
                size="sm"
                variant="light"
                onClick={handleRemoveFriend}
                loading={loading}
                title="Remove Friend"
              >
                ✓
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
