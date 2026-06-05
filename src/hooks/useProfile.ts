import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();

  const profile = useMemo(
    () =>
      user
        ? {
            user_id: user.id,
            display_name: user.email?.split("@")[0] || null,
            avatar_url: null,
            email: user.email,
            role: user.role,
            phone: null,
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- memo reads only id/email/role, which are the listed deps
    [user?.id, user?.email, user?.role],
  );

  return {
    profile,
    loading: false,
    // eslint-disable-next-line @typescript-eslint/require-await -- stub; awaits the Kursserver API call once implemented
    updateProfile: async (updates: Record<string, any>) => {
      console.log("Profile update requested:", updates);
      // TODO: Implement profile update API call to Kursserver
    },
  };
}
