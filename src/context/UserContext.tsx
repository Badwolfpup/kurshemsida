import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';


type UserType = 'Regular' | 'Admin' | null;

interface UserContextType {
  isLoggedIn: boolean;
  userType: UserType;
  login: (type: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
       const decoded: any = jwtDecode(token);
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'regular';
        if (role === 'admin' || role === 'regular') {
          setUserType(role);
          setIsLoggedIn(true);
        } 
      } catch (error) {
          console.error('Invalid token:', error);
        logout();
        }
    }
  }, []); // Empty dependency array ensures this runs only once

  const login = (token: string) => {
    localStorage.setItem('token', token)
    const decoded: any = jwtDecode(token);
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    console.log('User role decoded from token:', role);
    setUserType(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserType(null);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, userType, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};