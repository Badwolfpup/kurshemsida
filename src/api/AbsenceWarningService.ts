const responseAction = (response: Response): void => {
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const absenceWarningService = {
  getLastAttendedDate: async (
    studentId: number
  ): Promise<{ lastAttendedDate: string | null }> => {
    const response = await fetch(
      `/api/absence-warning/last-attended/${studentId}`,
      { credentials: "include" }
    );
    responseAction(response);
    return await response.json();
  },

  sendAbsenceWarning: async (payload: {
    coachEmail: string;
    subject: string;
    body: string;
  }): Promise<void> => {
    const response = await fetch("/api/absence-warning/send", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    responseAction(response);
  },
};
