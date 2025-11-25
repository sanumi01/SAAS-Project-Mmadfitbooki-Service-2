// FIX: Removed unused 'SESSION_PRICE' import. The session price is now determined by the trainer's rate.
import { QUEUE_DATA } from '../constants';
import type { Trainer, TimeSlot, Booking, QueueItem, MonthAvailability } from '../types';
import { getAvailability } from './availabilityService';
import { getTrainers } from './staffService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const QUEUE_STORAGE_KEY = 'fitbook-pro-queue';
const BOOKINGS_STORAGE_KEY = 'maadfitbook-bookings';


export const fetchTrainers = async (): Promise<Trainer[]> => {
  await delay(200);
  return getTrainers();
};

export const fetchAvailability = async (trainerId: string, date: Date): Promise<TimeSlot[]> => {
  await delay(400);

  const customAvailability = getAvailability(trainerId, date);
  if (customAvailability) {
    return Object.entries(customAvailability)
      .map(([time, available]) => ({ time, available }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }
  
  // Fallback to pseudo-random generation if no custom availability is set
  const seed = date.getDate() + parseInt(trainerId, 10);
  const times: TimeSlot[] = [];
  for (let i = 7; i <= 21; i++) {
    const isAvailable = (seed + i) % 3 !== 0; 
    times.push({ time: `${i.toString().padStart(2, '0')}:00`, available: isAvailable });
    if (i < 21) { // Up to 9:30 PM
      const thirtyMinIsAvailable = !isAvailable;
      times.push({ time: `${i.toString().padStart(2, '0')}:30`, available: thirtyMinIsAvailable });
    }
  }
  return times;
};

export const fetchMonthAvailability = async (trainerId: string, dateInMonth: Date): Promise<MonthAvailability> => {
    await delay(500); // simulate network latency for a larger data fetch
    const year = dateInMonth.getFullYear();
    const month = dateInMonth.getMonth();
    
    const availability: MonthAvailability = {};
    const tempDate = new Date(year, month, 1);
  
    // Iterate through all days of the current month
    while (tempDate.getMonth() === month) {
      const day = tempDate.getDate();
      const currentDate = new Date(year, month, day);
      const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
      const customAvailability = getAvailability(trainerId, currentDate);
      let availableCount = 0;
  
      if (customAvailability) {
        availableCount = Object.values(customAvailability).filter(Boolean).length;
      } else {
        // Fallback pseudo-random generation consistent with fetchAvailability
        const seed = currentDate.getDate() + parseInt(trainerId, 10);
        for (let i = 7; i <= 21; i++) {
            if ((seed + i) % 3 !== 0) availableCount++;
            if (i < 21) {
                if (!((seed + i) % 3 !== 0)) availableCount++;
            }
        }
      }
      availability[dateKey] = availableCount;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return availability;
};

const saveBookings = (bookings: Booking[]) => {
    try {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings.map(b => ({...b, date: b.date.toISOString()}))));
    } catch (e) {
        console.error("Could not save bookings to localStorage", e);
    }
};

export const getBookings = (): Booking[] => {
    try {
        const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored).map((b: any) => ({...b, date: new Date(b.date)}));
        }
        return [];
    } catch (e) {
        console.error("Could not retrieve bookings from localStorage", e);
        return [];
    }
};

export const submitBooking = async (booking: Omit<Booking, 'trainer'> & { trainerId: string }): Promise<{ success: true; bookingId: string }> => {
  await delay(1000);
  console.log('Booking submitted:', booking);

  if (booking.sendEmailConfirmation) {
    console.log(`Mock email service: Sending confirmation to ${booking.clientEmail}...`);
  }

  const bookingId = `BK-${Date.now()}`;
  
  const allTrainers = getTrainers();
  const trainer = allTrainers.find(t => t.id === booking.trainerId);
  
  if (trainer) {
      const newBooking: Booking = { ...booking, bookingId, trainer };
      const allBookings = getBookings();
      saveBookings([...allBookings, newBooking]);
  }

  return { success: true, bookingId };
};

export const updateBooking = (updatedBooking: Booking): void => {
    const allBookings = getBookings();
    const updatedBookings = allBookings.map(b => 
        b.bookingId === updatedBooking.bookingId ? updatedBooking : b
    );
    saveBookings(updatedBookings);
};

export const cancelBooking = (bookingId: string): void => {
    const allBookings = getBookings();
    const updatedBookings = allBookings.filter(b => b.bookingId !== bookingId);
    saveBookings(updatedBookings);
};


// Queue Management
const getQueueFromStorage = (): QueueItem[] => {
    try {
        const storedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (storedQueue) {
            return JSON.parse(storedQueue);
        }
        // If nothing in storage, initialize with default data
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(QUEUE_DATA));
        return QUEUE_DATA;
    } catch (e) {
        console.error("Could not access queue from localStorage", e);
        return [...QUEUE_DATA];
    }
};

export const fetchQueue = async (): Promise<QueueItem[]> => {
    await delay(100);
    return getQueueFromStorage();
};

export const addToQueue = async (newItem: Omit<QueueItem, 'id'>): Promise<QueueItem[]> => {
    await delay(200);
    const currentQueue = getQueueFromStorage();
    const newQueueItem: QueueItem = { ...newItem, id: Date.now() };
    const updatedQueue = [...currentQueue, newQueueItem];
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    return updatedQueue;
};

export const advanceQueue = async (): Promise<QueueItem[]> => {
    await delay(200);
    const currentQueue = getQueueFromStorage();
    const updatedQueue = currentQueue.slice(1);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    return updatedQueue;
};

export const fetchAllTrainersAvailabilityForDay = async (date: Date): Promise<Record<string, TimeSlot[]>> => {
    const trainers = await fetchTrainers();
    const availabilityByTrainer: Record<string, TimeSlot[]> = {};
    for (const trainer of trainers) {
        availabilityByTrainer[trainer.id] = await fetchAvailability(trainer.id, date);
    }
    return availabilityByTrainer;
};

export const getDashboardStats = () => {
    const bookings = getBookings();
    const trainers = getTrainers();
    const now = new Date();

    const upcomingBookings = bookings.filter(b => b.date >= now);

    const revenueThisMonth = bookings
        .filter(b => b.date.getMonth() === now.getMonth() && b.date.getFullYear() === now.getFullYear())
        .reduce((sum, b) => sum + (b.price ?? 0) + (b.fee ?? 0), 0);

    let busiestTrainer = { name: 'N/A', count: 0 };
    if (upcomingBookings.length > 0) {
        const trainerCounts: Record<string, number> = {};
        for (const booking of upcomingBookings) {
            trainerCounts[booking.trainer.id] = (trainerCounts[booking.trainer.id] || 0) + 1;
        }

        const busiestId = Object.keys(trainerCounts).reduce((a, b) => trainerCounts[a] > trainerCounts[b] ? a : b);
        const busiestTrainerData = trainers.find(t => t.id === busiestId);
        
        if (busiestTrainerData) {
            busiestTrainer = {
                name: busiestTrainerData.name,
                count: trainerCounts[busiestId]
            };
        }
    }
    
    return {
        upcomingBookingsCount: upcomingBookings.length,
        revenueThisMonth,
        busiestTrainer,
    };
};
