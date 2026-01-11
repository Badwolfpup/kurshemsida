interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authLevel: number;  // Role as number
  isActive: boolean;
  course: number;
  coachId?: number | null;
}

export const getUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`/api/fetch-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as User[];
      data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      return data;
    }
    catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

export default getUsers;