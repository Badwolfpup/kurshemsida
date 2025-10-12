import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type UserType = 'regular' | 'admin' | null;

interface UserContextType {
  isLoggedIn: boolean;
  userType: UserType;
  login: (type: 'regular' | 'admin') => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    if (storedType === 'regular' || storedType === 'admin') {
      setUserType(storedType);
      setIsLoggedIn(true);
    }
  }, []); // Empty dependency array ensures this runs only once

  const login = (type: 'regular' | 'admin') => {
    setIsLoggedIn(true);
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    localStorage.removeItem('userType');
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