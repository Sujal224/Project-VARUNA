/**
 * VARUNA Notification Types
 */

export type NotificationCategory =
  | 'Cyclone Warning'
  | 'High Wave Warning'
  | 'Strong Wind Warning'
  | 'Route Hazard'
  | 'Marine Alert'
  | 'New PFZ Detected'
  | 'System Alert';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: NotificationCategory;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}
