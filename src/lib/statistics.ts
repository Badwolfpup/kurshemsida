// Pure statistics helpers for the Statistik page. No side effects — unit-testable.

export interface StatSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
}

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function min(nums: number[]): number {
  return nums.length === 0 ? 0 : Math.min(...nums);
}

export function max(nums: number[]): number {
  return nums.length === 0 ? 0 : Math.max(...nums);
}

// Population standard deviation.
export function stdDev(nums: number[]): number {
  if (nums.length === 0) return 0;
  const m = mean(nums);
  const variance = nums.reduce((acc, n) => acc + (n - m) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

export function summarize(nums: number[]): StatSummary {
  return {
    mean: mean(nums),
    median: median(nums),
    min: min(nums),
    max: max(nums),
    stdDev: stdDev(nums),
    count: nums.length,
  };
}

// A class day is Mon–Thu (getDay 1–4) and not a NoClass day.
// noClassKeys is a Set of "YYYY-MM-DD" strings.
export function isClassDay(date: Date, noClassKeys: Set<string>): boolean {
  const day = date.getDay();
  if (day < 1 || day > 4) return false;
  return !noClassKeys.has(dateKey(date));
}

// Local-date key "YYYY-MM-DD" (avoids UTC offset shifting the day).
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface SeatOccupancy {
  designated: number;
  available: number;
  capacity: number;
  pct: number; // 0–100, designated/capacity
}

export function seatOccupancy(designated: number, capacity: number): SeatOccupancy {
  const available = Math.max(0, capacity - designated);
  const pct = capacity > 0 ? Math.round((designated / capacity) * 100) : 0;
  return { designated, available, capacity, pct };
}

// Counts how many distinct table positions (row+column) are assigned in at least
// `threshold` of their weekly slots. Pass the flat list of assignments for one
// classroom across all days/periods. Each assignment record = one filled slot.
export function countFullyBookedTables(
  assignments: { row: number; column: number }[],
  threshold: number
): number {
  const perTable = new Map<string, number>();
  for (const a of assignments) {
    const key = `${a.row}-${a.column}`;
    perTable.set(key, (perTable.get(key) ?? 0) + 1);
  }
  let count = 0;
  for (const filled of perTable.values()) if (filled >= threshold) count++;
  return count;
}
