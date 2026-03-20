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
  responseAction(res);
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
  responseAction(res);
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
  responseAction(res);
}

const responseAction = (response: Response): void => {
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized. Redirecting to login.');
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};
