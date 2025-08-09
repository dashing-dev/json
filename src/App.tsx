import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Moon, Sun, Zap } from 'lucide-react';
import JsonInput from './components/JsonInput';
import JsonOutput from './components/JsonOutput';
import History from './components/History';
import { JsonError, JsonHistoryItem, ValidationResult } from './types';
import { saveToHistory, getHistory, clearHistory, saveSettings, getSettings } from './utils/storage';
import { validateJsonStructure } from './utils/jsonAnalyzer';

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [formattedJson, setFormattedJson] = useState('');
  const [minifiedJson, setMinifiedJson] = useState('');
  const [error, setError] = useState<JsonError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<JsonHistoryItem[]>([]);
  const [settings, setSettings] = useState(getSettings());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Load history on component mount
  useEffect(() => {
    setHistory(getHistory());
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const parseJsonWithPosition = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Try to extract line and column information
        const match = err.message.match(/at position (\d+)/);
        if (match) {
          const position = parseInt(match[1], 10);
          const lines = jsonString.substring(0, position).split('\n');
          const line = lines.length;
          const column = lines[lines.length - 1].length + 1;
          
          throw {
            ...err,
            position,
            line,
            column
          };
        }
      }
      throw err;
    }
  };

  const formatJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setError({ message: 'Please enter some JSON data' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const parsed = parseJsonWithPosition(jsonInput);
      const formatted = JSON.stringify(parsed, null, settings.indentSize);
      const minified = JSON.stringify(parsed);
      
      setJsonData(parsed);
      setFormattedJson(formatted);
      setMinifiedJson(minified);
      setError(null);
      
      // Save to history
      saveToHistory(parsed);
      setHistory(getHistory());
    } catch (err: any) {
      let errorMessage = 'Invalid JSON format';
      let position: number | undefined;
      let line: number | undefined;
      let column: number | undefined;

      if (err.message) {
        errorMessage = err.message;
        position = err.position;
        line = err.line;
        column = err.column;
      }

      setError({ message: errorMessage, position, line, column });
      setJsonData(null);
      setFormattedJson('');
      setMinifiedJson('');
    } finally {
      setIsLoading(false);
    }
  }, [jsonInput, settings.indentSize]);

  const minifyJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setError({ message: 'Please enter some JSON data' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = parseJsonWithPosition(jsonInput);
      const minified = JSON.stringify(parsed);
      
      setJsonInput(minified);
      setJsonData(parsed);
      setFormattedJson(JSON.stringify(parsed, null, settings.indentSize));
      setMinifiedJson(minified);
      setError(null);
    } catch (err: any) {
      setError({ message: err.message || 'Invalid JSON format' });
    } finally {
      setIsLoading(false);
    }
  }, [jsonInput, settings.indentSize]);

  const validateJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setError({ message: 'Please enter some JSON data' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = parseJsonWithPosition(jsonInput);
      const validation = validateJsonStructure(parsed);
      setValidationResult(validation);
      
      if (validation.errors.length === 0) {
        setJsonData(parsed);
        setFormattedJson(JSON.stringify(parsed, null, settings.indentSize));
        setMinifiedJson(JSON.stringify(parsed));
      }
    } catch (err: any) {
      setError({ message: err.message || 'Invalid JSON format' });
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [jsonInput, settings.indentSize]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const handleDownload = useCallback((text: string, filename: string) => {
    if (!text) return;

    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadFromHistory = useCallback((item: JsonHistoryItem) => {
    const formatted = JSON.stringify(item.json, null, settings.indentSize);
    setJsonInput(formatted);
    setJsonData(item.json);
    setFormattedJson(formatted);
    setMinifiedJson(JSON.stringify(item.json));
    setError(null);
    setValidationResult(null);
  }, [settings.indentSize]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const handleSettingsChange = useCallback((newSettings: any) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Apply theme immediately
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleSettingsChange({ ...settings, theme: newTheme });
  }, [settings, handleSettingsChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            formatJson();
            break;
          case 'm':
            e.preventDefault();
            minifyJson();
            break;
          case 'k':
            e.preventDefault();
            validateJson();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formatJson, minifyJson, validateJson]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  JSON Formatter & Analyzer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional JSON formatting, validation, and analysis tool
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Toggle theme"
              >
                {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Validation Results */}
      {validationResult && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`p-4 rounded-md ${validationResult.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className={validationResult.errors.length > 0 ? 'text-red-600' : 'text-green-600'} />
              <h3 className={`font-medium ${validationResult.errors.length > 0 ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                Validation {validationResult.errors.length > 0 ? 'Failed' : 'Passed'}
              </h3>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div className="mb-2">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Errors:</h4>
                <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Warnings:</h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-1">
            <JsonInput
              value={jsonInput}
              onChange={setJsonInput}
              error={error}
              onFormat={formatJson}
              onMinify={minifyJson}
              onValidate={validateJson}
              isLoading={isLoading}
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
            
            {/* History Section */}
            <div className="mt-8">
              <History
                history={history}
                onLoadFromHistory={handleLoadFromHistory}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2">
            <JsonOutput
              jsonData={jsonData}
              formattedJson={formattedJson}
              minifiedJson={minifiedJson}
              onCopy={handleCopy}
              onDownload={handleDownload}
              copySuccess={copySuccess}
              settings={settings}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs">Ctrl + Enter</kbd>
              <span>Format</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs">Ctrl + M</kbd>
              <span>Minify</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs">Ctrl + K</kbd>
              <span>Validate</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;


  