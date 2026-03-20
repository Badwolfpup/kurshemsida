const API = '/api/seating';

export interface SeatingAssignment {
  id: number;
  classroomId: number;
  dayOfWeek: number;
  period: string;
  row: number;
  column: number;
  studentId: number;
}

export async function getSeatingAssignments(classroomId: number, dayOfWeek: number): Promise<SeatingAssignment[]> {
  const res = await fetch(`${API}?classroomId=${classroomId}&dayOfWeek=${dayOfWeek}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch seating (${res.status})`);
  return res.json();
}

export async function assignSeat(data: {
  classroomId: number;
  dayOfWeek: number;
  period: string;
  row: number;
  column: number;
  studentId: number;
}): Promise<void> {
  const res = await fetch(`${API}/assign`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to assign seat (${res.status})`);
}

export async function clearSeat(data: {
  classroomId: number;
  dayOfWeek: number;
  period: string;
  row: number;
  column: number;
}): Promise<void> {
  const params = new URLSearchParams({
    classroomId: data.classroomId.toString(),
    dayOfWeek: data.dayOfWeek.toString(),
    period: data.period,
    row: data.row.toString(),
    column: data.column.toString(),
  });
  const res = await fetch(`${API}/clear?${params}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to clear seat (${res.status})`);
}
