import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Zap, Settings, AlertCircle } from 'lucide-react';
import { JsonError } from '../types';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error: JsonError | null;
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  isLoading: boolean;
  settings: any;
  onSettingsChange: (settings: any) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ 
  value, 
  onChange, 
  error, 
  onFormat, 
  onMinify,
  onValidate,
  isLoading,
  settings,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const getLineNumbers = () => {
    const lines = value.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  useEffect(() => {
    if (settings.autoFormat && value.trim() && !error) {
      const timeoutId = setTimeout(() => {
        onFormat();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [value, settings.autoFormat, onFormat, error]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">JSON Input</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Upload JSON file"
          >
            <Upload size={16} />
            Upload
          </button>
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Paste from clipboard"
          >
            <FileText size={16} />
            Paste
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoFormat}
                onChange={(e) => onSettingsChange({ ...settings, autoFormat: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto-format on input</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => onSettingsChange({ ...settings, showLineNumbers: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show line numbers</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Indent size:</span>
              <select
                value={settings.indentSize}
                onChange={(e) => onSettingsChange({ ...settings, indentSize: parseInt(e.target.value) })}
                className="px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={onFormat}
          disabled={isLoading || !value.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          <Zap size={16} />
          {isLoading ? 'Formatting...' : 'Format'}
        </button>
        <button
          onClick={onMinify}
          disabled={isLoading || !value.trim()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          Minify
        </button>
        <button
          onClick={onValidate}
          disabled={isLoading || !value.trim()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          <AlertCircle size={16} />
          Validate
        </button>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {settings.showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 flex flex-col text-xs text-gray-500 dark:text-gray-400 font-mono">
              {getLineNumbers().map(num => (
                <div key={num} className="px-2 py-1 text-right leading-6">
                  {num}
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your JSON here..."
            className={`flex-1 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${settings.showLineNumbers ? 'pl-16' : ''}`}
            style={{ minHeight: '300px', lineHeight: '1.5' }}
          />
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Invalid JSON</h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error.message}
                  {error.line && error.column && (
                    <div className="mt-1 text-xs">
                      Line {error.line}, Column {error.column}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default JsonInput;