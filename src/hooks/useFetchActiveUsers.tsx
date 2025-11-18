import { useState, useEffect, useCallback } from 'react';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  course: number;
  isActive: boolean;
}

export const useFetchActiveUsers = (setError: (error: string) => void) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/fetch-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: User[] = await response.json();
      data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      setActiveUsers(data.filter(user => user.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [setError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return activeUsers;
};