import type { AppSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'maadfitbook-settings';

const DEFAULT_SETTINGS: AppSettings = {
    defaultCancellationPolicy: "Cancellations must be made at least 24 hours in advance. Late cancellations or no-shows will be charged the full session fee.",
    emailConfirmationTemplate: `Hi {{clientName}},

This is a confirmation for your booking with {{trainerName}} on {{date}} at {{time}}.

We look forward to seeing you!
- The MmadFitbooki Team`,
    smsReminderTemplate: `Reminder: Your MmadFitbooki appointment with {{trainerName}} is on {{date}} at {{time}}.`,
};

export const getSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error("Could not get settings from localStorage", error);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: AppSettings): void => {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Could not save settings to localStorage", error);
    }
};