import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationPreferences } from '../types/notifications';

const API_BASE = '/api/notifications/preferences';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  loadError: string | null;
  saveError: string | null;
  savingKeys: Set<keyof NotificationPreferences>;
  toggle: (key: keyof NotificationPreferences) => void;
  retry: () => void;
  dismissError: () => void;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingKeys, setSavingKeys] = useState<Set<keyof NotificationPreferences>>(new Set());

  const debounceTimers = useRef<Map<keyof NotificationPreferences, ReturnType<typeof setTimeout>>>(new Map());
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to load preferences');
      const data = await response.json();
      setPreferences({
        matches: data.matches,
        messages: data.messages,
        promotions: data.promotions,
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (saveError) {
      dismissTimer.current = setTimeout(() => {
        setSaveError(null);
      }, 5000);
      return () => {
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
      };
    }
  }, [saveError]);

  const toggle = useCallback((key: keyof NotificationPreferences) => {
    if (!preferences) return;

    const existing = debounceTimers.current.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const previousValue = preferences[key];
    setPreferences(prev => prev ? { ...prev, [key]: !prev[key] } : prev);

    const timer = setTimeout(async () => {
      debounceTimers.current.delete(key);
      setSavingKeys(prev => new Set(prev).add(key));
      try {
        const currentPrefs = { ...preferences, [key]: !previousValue };
        const response = await fetch(API_BASE, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPrefs),
        });
        if (!response.ok) throw new Error('Failed to save preferences');
      } catch {
        setPreferences(prev => prev ? { ...prev, [key]: previousValue } : prev);
        setSaveError('Failed to save preference. Please try again.');
      } finally {
        setSavingKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }, 300);

    debounceTimers.current.set(key, timer);
  }, [preferences]);

  const retry = useCallback(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const dismissError = useCallback(() => {
    setSaveError(null);
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  return {
    preferences,
    isLoading,
    loadError,
    saveError,
    savingKeys,
    toggle,
    retry,
    dismissError,
  };
}
