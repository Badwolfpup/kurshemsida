import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import '../styles/button.css'

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
  const [addNewUserForm, setAddNewUserForm] = useState(false);

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

  const addUser = async ({firstName, lastName, email}: {firstName: string, lastName: string, email: string}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/add-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ FirstName: firstName, LastName: lastName, Email: email })
      });
      if (!response.ok) {
        throw new Error(`Failed to add user: ${response.status}`);
      }
      // Refetch users after adding a new user
      await fetchUsers();
      setAddNewUserForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getNewUserInputs = () => {
    const firstNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Förnamn"]') as HTMLInputElement).value;
    const lastNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Efternamn"]') as HTMLInputElement).value;
    const emailInput = (document.querySelector('.add-user-name-inputs input[placeholder="Email"]') as HTMLInputElement).value;
    return { firstName: firstNameInput, lastName: lastNameInput, email: emailInput };
  }

  const showAdddNewUserForm = () => {
    if (addNewUserForm) {
      return (
        <div className="add-user-form">
          <div className="add-user-name-inputs">
            <input type="text" placeholder="Förnamn"  required/>
            <input type="text" placeholder="Efternamn" required/>
            <input type="email" placeholder="Email" required/>
          </div>
          <div className="add-user-buttons">
            <button className='user-button' onClick={() => addUser(getNewUserInputs())}>Lägg till</button>
            <button className='user-button' onClick={() => setAddNewUserForm(false)}>Avbryt</button>
          </div>
        </div>
      )
    }
    else return (
      <button className='user-button' onClick={() => setAddNewUserForm(!addNewUserForm)}>Lägg till ny</button>
      )
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="manage-users-container">
    <div className="header-section">
      <h2>Aktiva deltagare</h2>
      {showAdddNewUserForm()}
    </div>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Namn</th>
              <th>Email</th>
              <th>Åtgärd</th>
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
              <th>Namn</th>
              <th>Email</th>
              <th>Åtgärd</th>
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