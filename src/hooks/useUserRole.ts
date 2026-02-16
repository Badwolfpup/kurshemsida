import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "Admin" | "Teacher" | "Coach" | "Student" | "Guest";

export function useUserRole() {
  const { user, loading } = useAuth();

  const role = user?.role ?? null;
  const isAdmin = role === "Admin" || role === "Teacher";
  const isCoach = role === "Coach";
  const isStudent = role === "Student";

  return { role, loading, isAdmin, isCoach, isStudent };
}
