
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
  experience: string;
  rate: number;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface TimeSlot {
  time: string; // e.g., "09:00"
  available: boolean;
}

export interface Booking {
  trainer: Trainer;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingId?: string;
  price?: number;
  fee?: number;
  sendEmailConfirmation?: boolean;
  reminderEmail?: boolean;
  reminderSms?: boolean;
  cancellationPolicy?: string;
}

export interface QueueItem {
    id: number;
    name: string;
    service: string;
}

export type Availability = Record<string, boolean>; // e.g. {"09:00": true, "09:30": false}

export type MonthAvailability = Record<string, number>; // key: "YYYY-MM-DD", value: available slot count

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface AppSettings {
    defaultCancellationPolicy: string;
    emailConfirmationTemplate: string;
    smsReminderTemplate: string;
}

export interface WorkoutExercise {
    name: string;
    sets: string;
    reps: string;
    rest: string;
}

export interface WorkoutActivity {
    exercise?: string;
    stretch?: string;
    duration: string;
}

export interface DailyWorkout {
    day: string;
    focus: string;
    warmup: WorkoutActivity[];
    exercises: WorkoutExercise[];
    cooldown: WorkoutActivity[];
}

export interface WorkoutPlan {
    planName: string;
    weeklySchedule: DailyWorkout[];
    disclaimer: string;
}

export interface WorkoutPreferences {
    goal: string;
    level: string;
    duration: number;
    equipment: string[];
    daysPerWeek: number;
    notes: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  fitnessGoal: string;
  experienceLevel: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}