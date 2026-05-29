// Participant status — mirrors the backend ParticipantStatus enum (stored as int).
export const STATUS_ONSITE = 1;
export const STATUS_DISTANCE = 2;
export const STATUS_PAUSED = 3;

// Distans/paus students aren't expected in the classroom: no absence warning,
// own attendance section, hidden empty attendance cells, excluded from seating.
export function isReducedAttendance(status: number | undefined | null): boolean {
  return status === STATUS_DISTANCE || status === STATUS_PAUSED;
}

// Short tag used in list rows (next to the Spår tag). Null = no tag (on-site).
export function statusTagLabel(status: number | undefined | null): string | null {
  if (status === STATUS_DISTANCE) return "Distans";
  if (status === STATUS_PAUSED) return "Pausad";
  return null;
}

// Longer label shown next to the name in the individual student view.
export function statusFullLabel(status: number | undefined | null): string | null {
  if (status === STATUS_DISTANCE) return "studerar på distans";
  if (status === STATUS_PAUSED) return "har en tillfällig paus";
  return null;
}
