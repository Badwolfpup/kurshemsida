import { useQuery, useMutation } from "@tanstack/react-query";
import { absenceWarningService } from "@/api/AbsenceWarningService";

/**
 * SCENARIO: Fetch last attended date for a student
 * CALLS: GET /api/absence-warning/last-attended/{studentId} → AbsenceWarningEndpoints.cs
 */
export function useLastAttendedDate(studentId: number | null) {
  return useQuery({
    queryKey: ["lastAttendedDate", studentId],
    queryFn: () => absenceWarningService.getLastAttendedDate(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * SCENARIO: Send absence warning email to a student's coach
 * CALLS: POST /api/absence-warning/send → AbsenceWarningEndpoints.cs
 * SIDE EFFECTS:
 *   - Sends email to coach via EmailService.SendEmailFireAndForget (backend, Resend API)
 *   - No-op in development mode (EmailService skips send)
 */
export function useSendAbsenceWarning() {
  return useMutation({
    mutationFn: absenceWarningService.sendAbsenceWarning,
  });
}
