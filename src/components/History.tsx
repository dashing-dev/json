import React from 'react';
import { Clock, Trash2, RefreshCw, FileText, Database, Hash } from 'lucide-react';
import { JsonHistoryItem } from '../types';
import { formatBytes } from '../utils/jsonAnalyzer';

interface HistoryProps {
  history: JsonHistoryItem[];
  onLoadFromHistory: (item: JsonHistoryItem) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onLoadFromHistory, onClearHistory }) => {
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTypeIcon = (type: JsonHistoryItem['type']) => {
    switch (type) {
      case 'array': return <Database size={14} className="text-blue-500" />;
      case 'object': return <Hash size={14} className="text-green-500" />;
      default: return <FileText size={14} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: JsonHistoryItem['type']) => {
    switch (type) {
      case 'array': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'object': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600';
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">History</h3>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <Clock size={48} className="mx-auto mb-3 opacity-50" />
          <p>No history yet</p>
          <p className="text-sm mt-1">Formatted JSONs will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">History</h3>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={`border rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group ${getTypeColor(item.type)}`}
            onClick={() => onLoadFromHistory(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(item.type)}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(item.size)}
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate mb-1">
                  {item.preview}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
              <RefreshCw size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;