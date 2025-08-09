import React, { useMemo } from 'react';
import { Table } from 'lucide-react';

interface JsonTableProps {
  data: any;
}

const JsonTable: React.FC<JsonTableProps> = ({ data }) => {
  const tableData = useMemo(() => {
    if (!data) return null;

    // Handle array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const allKeys = new Set<string>();
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key));
        }
      });

      const headers = Array.from(allKeys);
      const rows = data.map((item, index) => ({
        _index: index,
        ...headers.reduce((acc, key) => ({
          ...acc,
          [key]: item && typeof item === 'object' ? item[key] : undefined
        }), {})
      }));

      return { headers: ['Index', ...headers], rows };
    }

    // Handle single object
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const entries = Object.entries(data);
      return {
        headers: ['Key', 'Value', 'Type'],
        rows: entries.map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          type: Array.isArray(value) ? 'array' : typeof value
        }))
      };
    }

    return null;
  }, [data]);

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getValueColor = (value: any): string => {
    if (value === null) return 'text-gray-500';
    if (typeof value === 'string') return 'text-green-600 dark:text-green-400';
    if (typeof value === 'number') return 'text-orange-600 dark:text-orange-400';
    if (typeof value === 'boolean') return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-800 dark:text-gray-200';
  };

  if (!tableData) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <Table size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Cannot display as table</p>
        <p className="text-sm mt-2">Table view works best with arrays of objects or simple objects</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
          <tr>
            {tableData.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
            >
              {tableData.headers.map((header, colIndex) => {
                const cellValue = header === 'Index' ? rowIndex : (row as any)[header.toLowerCase()];
                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 font-mono text-xs ${getValueColor(cellValue)}`}
                  >
                    <div className="max-w-xs truncate" title={formatValue(cellValue)}>
                      {formatValue(cellValue)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JsonTable;