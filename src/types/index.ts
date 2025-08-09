export interface JsonHistoryItem {
  id: string;
  timestamp: number;
  json: any;
  preview: string;
  size: number;
  type: 'object' | 'array' | 'primitive';
}

export interface TreeNodeProps {
  data: any;
  keyName?: string;
  level?: number;
  isLast?: boolean;
  searchTerm?: string;
  path?: string;
}

export interface JsonError {
  message: string;
  position?: number;
  line?: number;
  column?: number;
}

export interface JsonStats {
  totalKeys: number;
  totalValues: number;
  maxDepth: number;
  dataTypes: Record<string, number>;
  arrayLengths: number[];
  size: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type ViewMode = 'tree' | 'formatted' | 'minified' | 'table';
export type Theme = 'light' | 'dark';