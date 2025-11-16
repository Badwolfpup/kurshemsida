
import React, { useState, useEffect} from 'react';
import '../styles/button.css'
import './UserPermissions.css';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

const UserPermissions: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
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
  };

  const populateDropdown = () => {
    const dropdown = document.getElementById("user-dropdown") as HTMLSelectElement;
    if (!dropdown) return;
    dropdown.innerHTML = '';
    activeUsers.forEach(user => {
      const option = document.createElement("option");
      option.value = user.email;
      option.text = `${user.firstName} ${user.lastName}`;
      dropdown.appendChild(option);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeUsers.length > 0) {
      populateDropdown();
    }
    setLoading(false);
  }, [activeUsers]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className='navbar'>
        <select id="user-dropdown" />
        <button className="user-button">Spara</button>
        <button className="user-button">Ångra</button>
      </div>
      <h2>User Permissions</h2>
      {/* Add your user permissions UI components here */}
    </div>
  );
};

export default UserPermissions;
