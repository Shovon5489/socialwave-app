import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import NotificationItem from '../components/NotificationItem';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { notificationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCheck, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      const items = res.data?.data?.notifications || res.data?.notifications || [];
      setNotifications(items);

      // Automatically mark notifications as read on backend when viewing
      if (items.some((n) => !n.isRead)) {
        notificationAPI.markAllRead().catch(() => {});
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // silent catch
    }
  };

  return (
    <MainLayout hideSidebars>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Stay updated with friends and activity</p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">No notifications yet</h3>
            <p className="text-sm mt-1">When friends like, comment, or interact with you, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                onRead={handleRead}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
