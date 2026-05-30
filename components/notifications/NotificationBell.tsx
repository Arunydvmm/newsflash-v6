'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import PreferencesPanel from './PreferencesPanel';
import NotificationHistory from './NotificationHistory';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowHistory(true)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible hover:opacity-100 hover:visible transition-all duration-200 z-40">
          <button
            onClick={() => {
              setShowHistory(true);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200 transition-colors"
          >
            View History
          </button>
          <button
            onClick={() => {
              setShowPreferences(true);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Preferences
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}
      {showHistory && (
        <NotificationHistory onClose={() => setShowHistory(false)} />
      )}
    </>
  );
}
