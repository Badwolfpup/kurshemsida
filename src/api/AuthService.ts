export interface MeResponse {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  authLevel: number;
}

export const authService = {
  me: async (): Promise<MeResponse | null> => {
    try {
      const response = await fetch("/api/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data as MeResponse;
    } catch (e) {
      console.error("/api/me error:", e);
      return null;
    }
  },

  emailValidation: async (
    email: string,
  ): Promise<{ ok: boolean; data?: unknown; error?: string }> => {
    try {
      const response = await fetch("/api/email-validation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        return { ok: false, error: errorText || "Ogiltig e-postadress." };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: "Kunde inte nå servern." };
    }
  },

  passcodeValidation: async (
    email: string,
    passcode: number,
    rememberMe: boolean,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/passcode-validation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passcode, rememberMe }),
      });
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          return {
            ok: false,
            error: errorData.detail || errorData.title || "Felaktig lösenkod.",
          };
        } catch {
          return { ok: false, error: text || "Felaktig lösenkod." };
        }
      }
      await response.json();
      return { ok: true };
    } catch {
      return { ok: false, error: "Kunde inte nå servern." };
    }
  },

  logout: async (): Promise<void> => {
    try {
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;";
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
};
