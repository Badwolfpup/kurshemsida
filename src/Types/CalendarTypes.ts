import type { Availability, Booking } from '@/api/BookingService';

export type CalendarEventType =
  | 'availability'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'rescheduled'
  | 'recurring'
  | 'busy';

export interface CalendarEventResource {
  type: CalendarEventType;
  availabilityId?: number;
  availability?: Availability;
  booking?: Booking;
  adminId?: number;
  color?: string;
  isOwn?: boolean;
  recurringEventId?: number;
  recurringEventName?: string;
  classroom?: number;
  busyTimeId?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: CalendarEventResource;
}

export interface RecurringEventInstance {
  eventId: number;
  name: string;
  start: string;
  end: string;
  date: string;
  adminId: number;
  frequency: string;
  isException: boolean;
  classroom?: number;
}
