import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';


type UserType = 'Admin' | 'Teacher' | 'Coach' | 'Student' | 'Guest' | null;


interface UserContextType {
  isLoggedIn: boolean;
  userType: UserType;
  userId: number | null;
  userEmail: string | null;
  userTokenExpired: Date | null;
  login: (type: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userTokenExpired, setUserTokenExpired] = useState<Date | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Function to clear any existing timeout
  const clearExpirationTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Function to set a new timeout for expiration
  const setExpirationTimeout = (expiredDate: Date) => {
    clearExpirationTimeout(); // Clear any existing
    const now = new Date();
    const delay = expiredDate.getTime() - now.getTime();
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        logout(); // Or just update state: setUserTokenExpired(new Date()); to trigger effects
      }, delay);
    } else {
      // Already expired, handle immediately
      logout();
    }
  };


  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'regular';
        if (role === 'Admin' || role === 'Teacher' || role === 'Coach' || role === 'Student' || role === 'Guest') {
          setUserType(role);
          setIsLoggedIn(true);
          const expired = decoded['expired'] ? new Date(decoded['expired']) : null;
          setUserTokenExpired(expired);
          if (expired) {
            setExpirationTimeout(expired); // Set timeout on load
          }          
          setUserEmail(decoded['sub'] || null);
          setUserId(decoded['id'] ? Number(decoded['id']) : null);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
     return () => clearExpirationTimeout(); // Cleanup on unmount
  }, []); // Empty dependency array ensures this runs only once

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    setUserType(role);
    setIsLoggedIn(true);
    setUserEmail(decoded['sub'] || null);
    setUserId(decoded['id'] ? Number(decoded['id']) : null);
    const expired = decoded['expired'] ? new Date(decoded['expired']) : null;
    setUserTokenExpired(expired);
    if (expired) {
      setExpirationTimeout(expired); // Set timeout on login
    }  
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserType(null);
    setUserEmail(null);
    setUserId(null);
    setUserTokenExpired(null);
    clearExpirationTimeout();
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, userType, userId, userEmail, userTokenExpired, login, logout }}>
      {children}
    </UserContext.Provider>
  );


};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};