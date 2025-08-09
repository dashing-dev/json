import React, { useState, useMemo } from 'react';
import { Copy, Download, CheckCircle, Search, BarChart3, Table, Eye, Minimize2 } from 'lucide-react';
import TreeNode from './TreeNode';
import JsonStats from './JsonStats';
import JsonTable from './JsonTable';
import { ViewMode } from '../types';

interface JsonOutputProps {
  jsonData: any;
  formattedJson: string;
  minifiedJson: string;
  onCopy: (text: string) => void;
  onDownload: (text: string, filename: string) => void;
  copySuccess: boolean;
  settings: any;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ 
  jsonData, 
  formattedJson, 
  minifiedJson,
  onCopy, 
  onDownload, 
  copySuccess,
  settings
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);

  const currentContent = useMemo(() => {
    switch (viewMode) {
      case 'minified': return minifiedJson;
      case 'formatted': return formattedJson;
      default: return formattedJson;
    }
  }, [viewMode, formattedJson, minifiedJson]);

  const searchResults = useMemo(() => {
    if (!searchTerm || !jsonData) return [];
    
    const results: string[] = [];
    const search = (obj: any, path: string = ''): void => {
      if (obj === null || obj === undefined) return;

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const currentPath = path ? `${path}[${index}]` : `[${index}]`;
          search(item, currentPath);
        });
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(currentPath);
          }
          
          search(obj[key], currentPath);
        });
      } else {
        const stringValue = String(obj).toLowerCase();
        if (stringValue.includes(searchTerm.toLowerCase())) {
          results.push(path);
        }
      }
    };

    search(jsonData);
    return results;
  }, [jsonData, searchTerm]);

  if (!jsonData && !formattedJson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg font-medium">No JSON to display</p>
          <p className="text-sm mt-2">Enter valid JSON on the left and click Format</p>
        </div>
      </div>
    );
  }

  const viewModeButtons = [
    { mode: 'tree' as ViewMode, icon: Eye, label: 'Tree View' },
    { mode: 'formatted' as ViewMode, icon: Eye, label: 'Formatted' },
    { mode: 'minified' as ViewMode, icon: Minimize2, label: 'Minified' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">JSON Output</h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Show statistics"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => onCopy(currentContent)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors duration-200"
          >
            {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => onDownload(currentContent, `json-${viewMode}-${Date.now()}.json`)}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md font-medium transition-colors duration-200"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {(viewMode === 'tree' || searchTerm) && (
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search keys and values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          {searchTerm && searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {showStats && jsonData && (
        <div className="mb-4">
          <JsonStats data={jsonData} />
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        {viewMode === 'tree' ? (
          <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
            <TreeNode data={jsonData} searchTerm={searchTerm} />
          </div>
        ) : viewMode === 'table' ? (
          <div className="border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
            <JsonTable data={jsonData} />
          </div>
        ) : (
          <pre className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-900 h-full overflow-auto font-mono text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {currentContent}
          </pre>
        )}
      </div>
    </div>
  );
};

export default JsonOutput;