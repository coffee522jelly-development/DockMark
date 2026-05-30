import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T, type: 'local' | 'sync' | 'localStorage' = 'localStorage') {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (type === 'localStorage') {
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          setStoredValue(JSON.parse(item));
        } catch (e) {
          setStoredValue(item as any);
        }
      }
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      });
    }
  }, [key, type]);

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    if (type === 'localStorage') {
      window.localStorage.setItem(key, typeof valueToStore === 'string' ? valueToStore : JSON.stringify(valueToStore));
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: valueToStore });
    }
  };

  return [storedValue, setValue] as const;
}
