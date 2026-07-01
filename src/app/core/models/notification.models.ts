export type NotificationType =
  | 'RESUME_UPLOADED'
  | 'RESUME_ACTIVATED'
  | 'JOB_SAVED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_UPDATED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}
