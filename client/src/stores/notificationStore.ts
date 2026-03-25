import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'candidate' | 'insight' | 'status' | 'system';
  titleKey: string;
  titleParams?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'candidate',
    titleKey: 'notifications.new_candidate',
    titleParams: { job: 'Senior Developer' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'insight',
    titleKey: 'notifications.insight_ready',
    titleParams: { title: 'Sales trend detected' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'status',
    titleKey: 'notifications.candidate_moved',
    titleParams: { stage: 'Interview' },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    type: 'candidate',
    titleKey: 'notifications.new_candidate',
    titleParams: { job: 'Marketing Manager' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '5',
    type: 'insight',
    titleKey: 'notifications.insight_ready',
    titleParams: { title: 'Revenue anomaly in Q4' },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (n.read ? 0 : 1),
    }));
  },
}));
