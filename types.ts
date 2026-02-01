
export interface ImageState {
  original: string | null;
  modified: string | null;
  loading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  original: string;
  modified: string;
  prompt: string;
  timestamp: number;
}
