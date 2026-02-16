import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService } from "@/api/AuthService";

type UserRole = "Admin" | "Teacher" | "Coach" | "Student" | "Guest" | null;

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  authLevel: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isGuest: boolean;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  signOut: () => Promise<void>;
  enterAsGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseRole(raw: string | undefined): UserRole {
  if (!raw) return null;
  const map: Record<string, UserRole> = {
    "1": "Admin",
    "2": "Teacher",
    "3": "Coach",
    "4": "Student",
    "5": "Guest",
    Admin: "Admin",
    Teacher: "Teacher",
    Coach: "Coach",
    Student: "Student",
    Guest: "Guest",
  };
  return map[raw] ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const login = async () => {
    try {
      const me = await authService.me();
      if (me) {
        setUser({
          id: Number(me.id),
          email: me.email,
          role: parseRole(me.role),
          firstName: me.firstName ?? "",
          lastName: me.lastName ?? "",
          authLevel: me.authLevel ?? 5,
        });
        setIsGuest(false);
      }
    } catch (error) {
      console.error("Login check failed:", error);
    }
  };

  useEffect(() => {
    login().finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setIsGuest(false);
  };

  const enterAsGuest = () => setIsGuest(true);
  const exitGuest = () => setIsGuest(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        isLoggedIn: user !== null,
        login,
        signOut,
        enterAsGuest,
        exitGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
