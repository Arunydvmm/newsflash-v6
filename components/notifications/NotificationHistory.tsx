'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, X, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'weather_alert' | 'article' | 'system';
  read: boolean;
  data?: {
    temperature?: number;
    condition?: string;
    location?: string;
    link?: string;
  };
  createdAt: string;
}

interface NotificationHistoryProps {
  onClose: () => void;
}

export default function NotificationHistory({ onClose }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const LIMIT = 10;

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/notifications?limit=${LIMIT}&skip=${page * LIMIT}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setTotal(data.data.total);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather_alert':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'article':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Notification History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No notifications yet</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          {notification.data?.location && (
                            <p className="text-xs text-gray-500 mt-2">
                              📍 {notification.data.location}
                              {notification.data.temperature && (
                                <> • {notification.data.temperature}°C</>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification._id)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {Math.ceil(total / LIMIT)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / LIMIT) - 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
