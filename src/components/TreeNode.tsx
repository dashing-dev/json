import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, Copy } from 'lucide-react';
import { TreeNodeProps } from '../types';

const TreeNode: React.FC<TreeNodeProps> = ({ 
  data, 
  keyName, 
  level = 0, 
  isLast = true, 
  searchTerm = '',
  path = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  const getValueColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600 dark:text-green-400';
      case 'number': return 'text-orange-600 dark:text-orange-400';
      case 'boolean': return 'text-purple-600 dark:text-purple-400';
      case 'null': return 'text-gray-500 dark:text-gray-400';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  const formatValue = (value: any, type: string): string => {
    switch (type) {
      case 'string': return `"${value}"`;
      case 'null': return 'null';
      default: return String(value);
    }
  };

  const isExpandable = (value: any): boolean => {
    return value !== null && (typeof value === 'object' || Array.isArray(value)) && 
           (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0);
  };

  const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(path);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  const isHighlighted = useMemo(() => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    
    if (keyName && keyName.toLowerCase().includes(searchLower)) return true;
    if (!isExpandable(data)) {
      const valueStr = String(data).toLowerCase();
      return valueStr.includes(searchLower);
    }
    return false;
  }, [searchTerm, keyName, data]);

  const renderValue = () => {
    const type = getValueType(data);
    const color = getValueColor(type);
    
    if (!isExpandable(data)) {
      return (
        <div className={`inline-flex items-center gap-2 ${isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded' : ''}`}>
          <span className={`${color} font-mono`}>
            {highlightText(formatValue(data, type), searchTerm)}
          </span>
          {path && (
            <button
              onClick={copyPath}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
              title="Copy path"
            >
              <Copy size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      );
    }

    const isArray = Array.isArray(data);
    const itemCount = isArray ? data.length : Object.keys(data).length;
    const bracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';

    return (
      <div className="group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 transition-colors ${isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
        >
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
          )}
          <span className="text-gray-800 dark:text-gray-200 font-mono">
            {bracket}
          </span>
          {!isExpanded && (
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
              {itemCount} {isArray ? 'items' : 'keys'}
            </span>
          )}
          {path && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyPath();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all ml-2"
              title="Copy path"
            >
              <Copy size={12} className="text-gray-500" />
            </button>
          )}
        </button>
        
        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 mt-1">
            {isArray ? (
              data.map((item: any, index: number) => (
                <div key={index} className="py-1 group">
                  <span className="text-blue-600 dark:text-blue-400 font-mono mr-2">{index}:</span>
                  <TreeNode
                    data={item}
                    level={level + 1}
                    isLast={index === data.length - 1}
                    searchTerm={searchTerm}
                    path={path ? `${path}[${index}]` : `[${index}]`}
                  />
                </div>
              ))
            ) : (
              Object.entries(data).map(([key, value], index, entries) => (
                <div key={key} className="py-1 group">
                  <span className={`text-blue-600 dark:text-blue-400 font-mono mr-2 ${keyName && keyName.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded' : ''}`}>
                    "{highlightText(key, searchTerm)}":
                  </span>
                  <TreeNode
                    data={value}
                    keyName={key}
                    level={level + 1}
                    isLast={index === entries.length - 1}
                    searchTerm={searchTerm}
                    path={path ? `${path}.${key}` : key}
                  />
                </div>
              ))
            )}
          </div>
        )}
        
        {isExpanded && (
          <span className="text-gray-800 dark:text-gray-200 font-mono ml-4">
            {closeBracket}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="leading-relaxed">
      {renderValue()}
    </div>
  );
};

export default TreeNode;