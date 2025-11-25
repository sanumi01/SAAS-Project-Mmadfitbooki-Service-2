// Calendar Integration Service for MMAD FitBooki
// Supports Google Calendar, Outlook, and Apple Calendar integration

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: CalendarReminder[];
  recurrence?: CalendarRecurrence;
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface CalendarRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'ical';
  isConnected: boolean;
  email?: string;
}

export class CalendarService {
  private static readonly GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  private static readonly MICROSOFT_CLIENT_ID = process.env.REACT_APP_MICROSOFT_CLIENT_ID || '';

  // Initialize calendar providers
  static async initialize(): Promise<void> {
    // Load Google Calendar API
    if (this.GOOGLE_CLIENT_ID && typeof window !== 'undefined') {
      await this.loadGoogleCalendarAPI();
    }

    // Load Microsoft Graph API
    if (this.MICROSOFT_CLIENT_ID && typeof window !== 'undefined') {
      await this.loadMicrosoftGraphAPI();
    }
  }

  // Connect to Google Calendar
  static async connectGoogleCalendar(): Promise<CalendarProvider> {
    try {
      // @ts-ignore
      const gapi = window.gapi;
      
      await gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: this.GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar'
        });
      });

      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const profile = user.getBasicProfile();

      const provider: CalendarProvider = {
        id: 'google',
        name: 'Google Calendar',
        type: 'google',
        isConnected: true,
        email: profile.getEmail(),
      };

      // Store connection info
      localStorage.setItem('googleCalendarToken', user.getAuthResponse().access_token);
      localStorage.setItem('calendarProvider', JSON.stringify(provider));

      return provider;
    } catch (error) {
      throw new Error('Failed to connect to Google Calendar');
    }
  }

  // Connect to Outlook Calendar
  static async connectOutlookCalendar(): Promise<CalendarProvider> {
    try {
      // @ts-ignore
      const msal = window.msal;
      
      const msalInstance = new msal.PublicClientApplication({
        auth: {
          clientId: this.MICROSOFT_CLIENT_ID,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin,
        },
      });

      const loginRequest = {
        scopes: ['https://graph.microsoft.com/calendars.readwrite'],
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      const provider: CalendarProvider = {
        id: 'outlook',
        name: 'Outlook Calendar',
        type: 'outlook',
        isConnected: true,
        email: response.account.username,
      };

      // Store connection info
      localStorage.setItem('outlookCalendarToken', response.accessToken);
      localStorage.setItem('calendarProvider', JSON.stringify(provider));

      return provider;
    } catch (error) {
      throw new Error('Failed to connect to Outlook Calendar');
    }
  }

  // Get connected calendar providers
  static getConnectedProviders(): CalendarProvider[] {
    const providers: CalendarProvider[] = [];
    
    const storedProvider = localStorage.getItem('calendarProvider');
    if (storedProvider) {
      providers.push(JSON.parse(storedProvider));
    }

    return providers;
  }

  // Create calendar event for booking
  static async createBookingEvent(
    bookingId: string,
    trainerName: string,
    customerName: string,
    serviceType: string,
    startTime: Date,
    endTime: Date,
    location?: string
  ): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      id: `booking-${bookingId}`,
      title: `${serviceType} with ${trainerName}`,
      description: `Fitness session booked through MMAD FitBooki\n\nCustomer: ${customerName}\nTrainer: ${trainerName}\nService: ${serviceType}`,
      startTime,
      endTime,
      location: location || 'MMAD FitBooki Studio',
      reminders: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    };

    const providers = this.getConnectedProviders();
    
    for (const provider of providers) {
      try {
        switch (provider.type) {
          case 'google':
            await this.createGoogleCalendarEvent(event);
            break;
          case 'outlook':
            await this.createOutlookCalendarEvent(event);
            break;
        }
      } catch (error) {
        console.error(`Failed to create event in ${provider.name}:`, error);
      }
    }

    return event;
  }

  // Create Google Calendar event
  private static async createGoogleCalendarEvent(event: CalendarEvent): Promise<void> {
    const token = localStorage.getItem('googleCalendarToken');
    if (!token) throw new Error('Google Calendar not connected');

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: event.location,
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(reminder => ({
          method: reminder.method === 'popup' ? 'popup' : 'email',
          minutes: reminder.minutes,
        })),
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event');
    }
  }

  // Create Outlook Calendar event
  private static async createOutlookCalendarEvent(event: CalendarEvent): Promise<void> {
    const token = localStorage.getItem('outlookCalendarToken');
    if (!token) throw new Error('Outlook Calendar not connected');

    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'text',
        content: event.description,
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: {
        displayName: event.location,
      },
      reminderMinutesBeforeStart: event.reminders?.[0]?.minutes || 15,
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outlookEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to create Outlook Calendar event');
    }
  }

  // Update calendar event
  static async updateBookingEvent(
    bookingId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    const providers = this.getConnectedProviders();
    
    for (const provider of providers) {
      try {
        switch (provider.type) {
          case 'google':
            await this.updateGoogleCalendarEvent(bookingId, updates);
            break;
          case 'outlook':
            await this.updateOutlookCalendarEvent(bookingId, updates);
            break;
        }
      } catch (error) {
        console.error(`Failed to update event in ${provider.name}:`, error);
      }
    }
  }

  // Delete calendar event
  static async deleteBookingEvent(bookingId: string): Promise<void> {
    const providers = this.getConnectedProviders();
    
    for (const provider of providers) {
      try {
        switch (provider.type) {
          case 'google':
            await this.deleteGoogleCalendarEvent(bookingId);
            break;
          case 'outlook':
            await this.deleteOutlookCalendarEvent(bookingId);
            break;
        }
      } catch (error) {
        console.error(`Failed to delete event in ${provider.name}:`, error);
      }
    }
  }

  // Update Google Calendar event
  private static async updateGoogleCalendarEvent(bookingId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const token = localStorage.getItem('googleCalendarToken');
    if (!token) throw new Error('Google Calendar not connected');

    const eventId = `booking-${bookingId}`;
    const patchBody: any = {};
    if (updates.title) patchBody.summary = updates.title;
    if (updates.description) patchBody.description = updates.description;
    if (updates.location) patchBody.location = updates.location;
    if (updates.startTime) patchBody.start = { dateTime: updates.startTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    if (updates.endTime) patchBody.end = { dateTime: updates.endTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchBody),
    });

    if (!response.ok) {
      throw new Error('Failed to update Google Calendar event');
    }
  }

  // Update Outlook Calendar event
  private static async updateOutlookCalendarEvent(bookingId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const token = localStorage.getItem('outlookCalendarToken');
    if (!token) throw new Error('Outlook Calendar not connected');

    const eventId = `booking-${bookingId}`;
    const patchBody: any = {};
    if (updates.title) patchBody.subject = updates.title;
    if (updates.description) patchBody.body = { contentType: 'text', content: updates.description };
    if (updates.startTime) patchBody.start = { dateTime: updates.startTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    if (updates.endTime) patchBody.end = { dateTime: updates.endTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchBody),
    });

    if (!response.ok) {
      throw new Error('Failed to update Outlook Calendar event');
    }
  }

  // Delete Google Calendar event
  private static async deleteGoogleCalendarEvent(bookingId: string): Promise<void> {
    const token = localStorage.getItem('googleCalendarToken');
    if (!token) throw new Error('Google Calendar not connected');

    const eventId = `booking-${bookingId}`;
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  // Delete Outlook Calendar event
  private static async deleteOutlookCalendarEvent(bookingId: string): Promise<void> {
    const token = localStorage.getItem('outlookCalendarToken');
    if (!token) throw new Error('Outlook Calendar not connected');

    const eventId = `booking-${bookingId}`;
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete Outlook Calendar event');
    }
  }

  // Generate iCal file for download
  static generateICalFile(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MMAD FitBooki//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@mmadfitbooki.com`,
      `DTSTART:${formatDate(event.startTime)}`,
      `DTEND:${formatDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return icalContent;
  }

  // Download iCal file
  static downloadICalFile(event: CalendarEvent): void {
    const icalContent = this.generateICalFile(event);
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Get available time slots from calendar
  static async getAvailableTimeSlots(
    date: Date,
    duration: number = 60
  ): Promise<Date[]> {
    // This would integrate with the trainer's calendar to find available slots
    const slots: Date[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);
      
      // Check if slot is available (would check against existing bookings)
      const isAvailable = await this.isTimeSlotAvailable(slotTime, duration);
      if (isAvailable) {
        slots.push(slotTime);
      }
    }
    
    return slots;
  }

  // Check if time slot is available
  private static async isTimeSlotAvailable(
    startTime: Date,
    duration: number
  ): Promise<boolean> {
    // This would check against existing bookings in the database
    // For now, return true (implement actual logic based on your booking system)
    return true;
  }

  // Load Google Calendar API
  private static async loadGoogleCalendarAPI(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  // Load Microsoft Graph API
  private static async loadMicrosoftGraphAPI(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.14.2/js/msal-browser.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  // Disconnect calendar provider
  static disconnectProvider(providerId: string): void {
    localStorage.removeItem(`${providerId}CalendarToken`);
    localStorage.removeItem('calendarProvider');
  }

  // Sync booking with calendar
  static async syncBookingWithCalendar(booking: any): Promise<void> {
    const startTime = new Date(booking.date + 'T' + booking.startTime);
    const endTime = new Date(booking.date + 'T' + booking.endTime);
    
    await this.createBookingEvent(
      booking.id,
      booking.trainerName,
      booking.customerName,
      booking.serviceType,
      startTime,
      endTime,
      booking.location
    );
  }
}

export default CalendarService;