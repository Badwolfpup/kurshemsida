import React, { useState, useEffect } from 'react';
import './ManageUsers.css';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

const ManageUsers: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
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
      setActiveUsers(data.filter(user => user.isActive));
      setInactiveUsers(data.filter(user => !user.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchUsers();
    setLoading(false);
  }, []);

  const changeActiveStatus = async (user: User) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:5001/api/${(user.isActive ? "inactivate-user" : "activate-user")}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: user.email })
      });
      if (!response.ok) {
        throw new Error(`Failed to ${(user.isActive ? "inactivate" : "activate")} user: ${response.status}`);
      }
      // Refetch users after status change
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="manage-users-container">
      <h2>Aktiva deltagare</h2>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length === 0 ? (
              <tr>
                <td colSpan={3}>No active users found.</td>
              </tr>
            ) : (
              activeUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="user-button" onClick={() => changeActiveStatus(user)}>Inaktivera</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <br /><br />
      <h2>Inaktiva deltagare</h2>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inactiveUsers.length === 0 ? (
              <tr>
                <td colSpan={3}>No inactive users found.</td>
              </tr>
            ) : (
              inactiveUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="user-button" onClick={() => changeActiveStatus(user)}>Aktivera</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;