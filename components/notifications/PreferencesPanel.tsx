'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, Save, X } from 'lucide-react';

interface UserPreferences {
  notificationsEnabled: boolean;
  notificationTypes: {
    weatherAlerts: boolean;
    articles: boolean;
    system: boolean;
  };
  weatherAlertTypes: {
    temperatureChange: boolean;
    storms: boolean;
    extremeTemps: boolean;
  };
  temperatureThreshold: number;
  extremeTempLow: number;
  extremeTempHigh: number;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  notificationFrequency: 'all' | 'storms_only' | 'extreme_only';
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

interface PreferencesPanelProps {
  onClose: () => void;
}

export default function PreferencesPanel({ onClose }: PreferencesPanelProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      } else {
        setError('Failed to load preferences');
      }
    } catch (err) {
      setError('Error loading preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSuccess('Preferences saved successfully');
        setTimeout(() => onClose(), 1500);
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <p className="text-center text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Main Toggle */}
          <div className="border-b pb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notificationsEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="font-semibold text-gray-900">Enable Notifications</span>
            </label>
          </div>

          {/* Notification Types */}
          <div className="border-b pb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notificationTypes.weatherAlerts}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notificationTypes: {
                        ...preferences.notificationTypes,
                        weatherAlerts: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Weather Alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notificationTypes.articles}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notificationTypes: {
                        ...preferences.notificationTypes,
                        articles: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Article Updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notificationTypes.system}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notificationTypes: {
                        ...preferences.notificationTypes,
                        system: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">System Notifications</span>
              </label>
            </div>
          </div>

          {/* Weather Alert Types */}
          <div className="border-b pb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Weather Alert Types</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weatherAlertTypes.temperatureChange}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weatherAlertTypes: {
                        ...preferences.weatherAlertTypes,
                        temperatureChange: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Temperature Changes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weatherAlertTypes.storms}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weatherAlertTypes: {
                        ...preferences.weatherAlertTypes,
                        storms: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Storms & Heavy Rain</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weatherAlertTypes.extremeTemps}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weatherAlertTypes: {
                        ...preferences.weatherAlertTypes,
                        extremeTemps: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Extreme Temperatures</span>
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Quiet Hours</h3>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700">Enable Quiet Hours</span>
            </label>
            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delivery Methods */}
          <div className="border-b pb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Methods</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotificationsEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      pushNotificationsEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Push Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inAppNotificationsEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      inAppNotificationsEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">In-App Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotificationsEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotificationsEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-gray-700">Email Notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
