import { JsonHistoryItem } from '../types';

const STORAGE_KEY = 'json-formatter-history';
const SETTINGS_KEY = 'json-formatter-settings';
const MAX_HISTORY_ITEMS = 10;

export const saveToHistory = (json: any): void => {
  try {
    const history = getHistory();
    const jsonString = JSON.stringify(json);
    const preview = jsonString.slice(0, 100) + (jsonString.length > 100 ? '...' : '');
    
    const getType = (data: any): 'object' | 'array' | 'primitive' => {
      if (Array.isArray(data)) return 'array';
      if (data !== null && typeof data === 'object') return 'object';
      return 'primitive';
    };
    
    const newItem: JsonHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      json,
      preview,
      size: new Blob([jsonString]).size,
      type: getType(json)
    };

    // Remove duplicates and add new item
    const filteredHistory = history.filter(item => 
      JSON.stringify(item.json) !== JSON.stringify(json)
    );
    
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = (): JsonHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveSettings = (settings: any): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const getSettings = (): any => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      theme: 'light',
      autoFormat: false,
      indentSize: 2,
      showLineNumbers: true
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      theme: 'light',
      autoFormat: false,
      indentSize: 2,
      showLineNumbers: true
    };
  }
};