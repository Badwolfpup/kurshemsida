import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';



type UserType = 'Admin' | 'Teacher' | 'Coach' | 'Student' | 'Guest' | null;


interface UserContextType {
  isLoggedIn: boolean;
  userType: UserType;
  userId: number | null;
  userEmail: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () =>  login().finally(() => setIsLoading(false)); 
    checkLogin();
  }, []); 

  const login = async () => {
    try {
      const response = await fetch('/api/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserId(Number(data.id));
        setUserEmail(data.email);
        setUserType(data.role);
        setIsLoggedIn(true);
      } else {
        console.error('Not authenticated - response not OK');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }


  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUserEmail(null);
    setUserId(null);
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, userType, userId, userEmail, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );


};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};