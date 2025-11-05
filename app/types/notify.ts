export type NotifyLevel = 'success' | 'error' | 'info' | 'warning';

export interface NotifyOptions {
  title?: string;
  timeout?: number;   // ms
  closeOnClick?: boolean;
  // ...pridáš, ak bude treba (id, icon, etc.)
}
