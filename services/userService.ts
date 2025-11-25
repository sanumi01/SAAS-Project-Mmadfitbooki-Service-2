
import type { UserProfile } from '../types';

const USER_PROFILE_STORAGE_KEY = 'maadfitbook-user-profile';

const DEFAULT_USER_PROFILE: UserProfile = {
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    phone: '555-123-4567',
    fitnessGoal: 'General Fitness',
    experienceLevel: 'Intermediate',
    notificationPreferences: {
        email: true,
        sms: false,
    },
};

export const getUserProfile = (): UserProfile => {
    try {
        const stored = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_USER_PROFILE, ...JSON.parse(stored) };
        }
        return DEFAULT_USER_PROFILE;
    } catch (error) {
        console.error("Could not get user profile from localStorage", error);
        return DEFAULT_USER_PROFILE;
    }
};

export const saveUserProfile = (profile: UserProfile): void => {
    try {
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Could not save user profile to localStorage", error);
    }
};
