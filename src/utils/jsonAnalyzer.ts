import { JsonStats, ValidationResult } from '../types';

export const analyzeJson = (data: any): JsonStats => {
  const stats: JsonStats = {
    totalKeys: 0,
    totalValues: 0,
    maxDepth: 0,
    dataTypes: {
      string: 0,
      number: 0,
      boolean: 0,
      null: 0,
      object: 0,
      array: 0
    },
    arrayLengths: [],
    size: new Blob([JSON.stringify(data)]).size
  };

  const analyze = (obj: any, depth: number = 0): void => {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (obj === null) {
      stats.dataTypes.null++;
      stats.totalValues++;
    } else if (Array.isArray(obj)) {
      stats.dataTypes.array++;
      stats.arrayLengths.push(obj.length);
      stats.totalValues++;
      obj.forEach(item => analyze(item, depth + 1));
    } else if (typeof obj === 'object') {
      stats.dataTypes.object++;
      stats.totalValues++;
      Object.keys(obj).forEach(key => {
        stats.totalKeys++;
        analyze(obj[key], depth + 1);
      });
    } else {
      const type = typeof obj;
      if (type in stats.dataTypes) {
        stats.dataTypes[type as keyof typeof stats.dataTypes]++;
      }
      stats.totalValues++;
    }
  };

  analyze(data);
  return stats;
};

export const validateJsonStructure = (data: any): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const validate = (obj: any, path: string = 'root'): void => {
    if (obj === null || obj === undefined) {
      result.warnings.push(`Null/undefined value at ${path}`);
      return;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        result.warnings.push(`Empty array at ${path}`);
      }
      obj.forEach((item, index) => {
        validate(item, `${path}[${index}]`);
      });
    } else if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        result.warnings.push(`Empty object at ${path}`);
      }
      
      // Check for potential issues
      keys.forEach(key => {
        if (key.includes(' ')) {
          result.warnings.push(`Key with spaces: "${key}" at ${path}`);
        }
        if (key.length > 50) {
          result.warnings.push(`Very long key name at ${path}.${key}`);
        }
        validate(obj[key], `${path}.${key}`);
      });
    } else if (typeof obj === 'string') {
      if (obj.length > 1000) {
        result.warnings.push(`Very long string value at ${path}`);
      }
    }
  };

  try {
    validate(data);
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error}`);
  }

  return result;
};

export const searchInJson = (data: any, searchTerm: string): string[] => {
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
        
        // Check if key matches
        if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(currentPath);
        }
        
        search(obj[key], currentPath);
      });
    } else {
      // Check if value matches
      const stringValue = String(obj).toLowerCase();
      if (stringValue.includes(searchTerm.toLowerCase())) {
        results.push(path);
      }
    }
  };

  search(data);
  return results;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};