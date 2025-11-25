
import type { QueueItem } from './types';

export const QUEUE_DATA: QueueItem[] = [
    { id: 1, name: 'Mike R.', service: 'Consultation' },
    { id: 2, name: 'Sarah L.', service: 'Drop-in Session' },
    { id: 3, name: 'David C.', service: 'Quick Stretch' },
];

export const AppView = {
    LOGIN: 'LOGIN',
    CUSTOMER_DASHBOARD: 'CUSTOMER_DASHBOARD',
    STAFF_DASHBOARD: 'STAFF_DASHBOARD',
    BOOKING: 'BOOKING',
    WORKOUT_PLANNER: 'WORKOUT_PLANNER',
    SCHEDULE: 'SCHEDULE',
    HISTORY: 'HISTORY',
    QUEUE: 'QUEUE',
    ACCOUNT: 'ACCOUNT',
    MANAGEMENT: 'MANAGEMENT',
} as const;

export type AppViewType = typeof AppView[keyof typeof AppView];

export const AdminViewTab = {
    DASHBOARD: 'DASHBOARD',
    BOOKINGS: 'BOOKINGS',
    STAFF: 'STAFF',
    SETTINGS: 'SETTINGS',
} as const;

export type AdminViewTabType = typeof AdminViewTab[keyof typeof AdminViewTab];
