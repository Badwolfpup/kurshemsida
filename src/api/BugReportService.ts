import type { BugReportType, AddBugReportDto } from "@/Types/BugReportType";

const responseAction = (response: Response): void => {
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const bugReportService = {
  async submitBugReport(dto: AddBugReportDto): Promise<boolean> {
    const response = await fetch("/api/bug-reports", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async getBugReports(): Promise<BugReportType[]> {
    const response = await fetch("/api/bug-reports", { credentials: "include" });
    responseAction(response);
    return await response.json();
  },
};
