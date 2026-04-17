import type { RecurringEventInstance, RecurringFrequency } from '@/Types/CalendarTypes';
import { toLocalIso } from './BookingService';

const API_URL = '/api/recurring-events';

export interface RecurringEvent {
  id: number;
  name: string;
  weekday: number;
  startTime: string;
  endTime: string;
  frequency: RecurringFrequency;
  startDate: string;
  adminId: number;
  createdAt: string;
  classroom?: number;
}

export interface CreateRecurringEventData {
  name: string;
  weekday: number;
  startTime: string; // TimeSpan format "HH:mm:ss"
  endTime: string;
  frequency: RecurringFrequency;
  startDate: string;
  adminId?: number;
  classroom?: number;
}

export interface UpdateRecurringEventData {
  name?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  frequency?: RecurringFrequency;
  classroom?: number;
}

export interface RecurringEventExceptionData {
  isDeleted?: boolean;
  name?: string;
  startTime?: string;
  endTime?: string;
  classroom?: number;
}

export async function getRecurringEventInstances(from: Date, to: Date): Promise<RecurringEventInstance[]> {
  const params = new URLSearchParams({
    from: toLocalIso(from),
    to: toLocalIso(to),
  });
  const res = await fetch(`${API_URL}?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch recurring events (${res.status})`);
  return res.json();
}

export async function createRecurringEvent(data: CreateRecurringEventData): Promise<RecurringEvent> {
  const res = await fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Create recurring event failed (${res.status})`);
  }
  return res.json();
}

export async function updateRecurringEvent(id: number, data: UpdateRecurringEventData): Promise<RecurringEvent> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Update recurring event failed (${res.status})`);
  }
  return res.json();
}

export async function deleteRecurringEvent(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete recurring event failed (${res.status})`);
  }
}

export async function setRecurringEventException(id: number, date: string, data: RecurringEventExceptionData): Promise<void> {
  const res = await fetch(`${API_URL}/${id}/exceptions/${date}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Set exception failed (${res.status})`);
  }
}

export async function removeRecurringEventException(id: number, date: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}/exceptions/${date}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Remove exception failed (${res.status})`);
  }
}
