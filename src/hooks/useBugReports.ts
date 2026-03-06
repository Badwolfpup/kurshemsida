import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bugReportService } from "@/api/BugReportService";
import type { AddBugReportDto } from "@/Types/BugReportType";

/**
 * SCENARIO: User submits a bug report or idea
 * CALLS: POST /api/bug-reports (BugReportEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates BugReport record (backend)
 *   - Invalidates ["bugReports"] cache
 */
export function useSubmitBugReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddBugReportDto) => bugReportService.submitBugReport(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });
}

/** SCENARIO: Admin fetches all bug reports and ideas */
export function useBugReports() {
  return useQuery({
    queryKey: ["bugReports"],
    queryFn: bugReportService.getBugReports,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
