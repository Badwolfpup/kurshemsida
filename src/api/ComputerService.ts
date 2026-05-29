import type { Computer, ComputerAssignment } from "@/Types/Computer";

const API = "/api";

export async function getComputers(): Promise<Computer[]> {
  const res = await fetch(`${API}/computers`, { credentials: "include" });
  responseAction(res);
  return res.json();
}

export async function getComputerAssignments(): Promise<ComputerAssignment[]> {
  const res = await fetch(`${API}/computer-assignments`, { credentials: "include" });
  responseAction(res);
  return res.json();
}

export async function addComputer(number: number): Promise<Computer> {
  const res = await fetch(`${API}/computers`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number }),
  });
  responseAction(res);
  return res.json();
}

export async function removeComputer(id: number): Promise<void> {
  const res = await fetch(`${API}/computers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  responseAction(res);
}

export async function setComputerOwner(data: {
  computerId: number;
  studentId: number | null;
  takesHome: boolean;
}): Promise<void> {
  const res = await fetch(`${API}/computers/owner`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  responseAction(res);
}

export async function assignComputerSlot(data: {
  computerId: number;
  dayOfWeek: number;
  period: string;
  studentId: number;
}): Promise<void> {
  const res = await fetch(`${API}/computer-assignments/assign`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  responseAction(res);
}

export async function clearComputerSlot(data: {
  computerId: number;
  dayOfWeek: number;
  period: string;
}): Promise<void> {
  const params = new URLSearchParams({
    computerId: data.computerId.toString(),
    dayOfWeek: data.dayOfWeek.toString(),
    period: data.period,
  });
  const res = await fetch(`${API}/computer-assignments/clear?${params}`, {
    method: "DELETE",
    credentials: "include",
  });
  responseAction(res);
}

function responseAction(response: Response): void {
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
