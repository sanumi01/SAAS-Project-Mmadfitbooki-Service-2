import type { Availability, TimeSlot } from '../types';

const generateKey = (trainerId: string, date: Date): string => {
  const yyyymmdd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  return `fitbook-availability-${trainerId}-${yyyymmdd}`;
};

export const getAvailability = (trainerId: string, date: Date): Availability | null => {
  try {
    const key = generateKey(trainerId, date);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to get availability from localStorage", error);
    return null;
  }
};

export const setAvailability = (trainerId: string, date: Date, availability: Availability): void => {
  try {
    const key = generateKey(trainerId, date);
    localStorage.setItem(key, JSON.stringify(availability));
  } catch (error) {
    console.error("Failed to set availability in localStorage", error);
  }
};

export const clearAvailability = (trainerId: string, date: Date): void => {
  try {
    const key = generateKey(trainerId, date);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear availability from localStorage", error);
  }
};

export const generateFullDaySlots = (isAvailable: boolean): Availability => {
    const slots: Availability = {};
    for (let i = 7; i <= 21; i++) {
        slots[`${i.toString().padStart(2, '0')}:00`] = isAvailable;
        if (i < 21) {
            slots[`${i.toString().padStart(2, '0')}:30`] = isAvailable;
        }
    }
    return slots;
};