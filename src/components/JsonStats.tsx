import React from 'react';
import { BarChart3, Hash, Layers, FileText } from 'lucide-react';
import { analyzeJson, formatBytes } from '../utils/jsonAnalyzer';

interface JsonStatsProps {
  data: any;
}

const JsonStats: React.FC<JsonStatsProps> = ({ data }) => {
  const stats = analyzeJson(data);

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = 
    ({ icon, label, value, color }) => (
      <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg border-l-4 ${color}`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">JSON Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={<Hash size={16} className="text-blue-600" />}
          label="Total Keys"
          value={stats.totalKeys}
          color="border-blue-500"
        />
        <StatCard
          icon={<FileText size={16} className="text-green-600" />}
          label="Total Values"
          value={stats.totalValues}
          color="border-green-500"
        />
        <StatCard
          icon={<Layers size={16} className="text-purple-600" />}
          label="Max Depth"
          value={stats.maxDepth}
          color="border-purple-500"
        />
        <StatCard
          icon={<FileText size={16} className="text-orange-600" />}
          label="Size"
          value={formatBytes(stats.size)}
          color="border-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Data Types</h4>
          <div className="space-y-2">
            {Object.entries(stats.dataTypes).map(([type, count]) => (
              count > 0 && (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{count}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {stats.arrayLengths.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Array Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Arrays Count</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats.arrayLengths.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Length</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(stats.arrayLengths.reduce((a, b) => a + b, 0) / stats.arrayLengths.length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Max Length</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.max(...stats.arrayLengths)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonStats;