import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import '../../styles/button.css'

interface Coach {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

const ManageCoaches: React.FC = () => {
  const [activeCoaches, setActiveCoaches] = useState<Coach[]>([]);
  const [inactiveCoaches, setInactiveCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addNewCoachForm, setAddNewCoachForm] = useState(false);

  const fetchCoaches = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/fetch-coaches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.log("här")
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Coach[] = await response.json();
      data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      setActiveCoaches(data.filter(coach => coach.isActive));
      setInactiveCoaches(data.filter(coach => !coach.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchCoaches();
    setLoading(false);
  }, []);

  const changeActiveStatus = async (coach: Coach) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:5001/api/${(coach.isActive ? "inactivate-coach" : "activate-coach")}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: coach.email })
      });
      if (!response.ok) {
        throw new Error(`Failed to ${(coach.isActive ? "inactivate" : "activate")} coach: ${response.status}`);
      }
      // Refetch coaches after status change
      await fetchCoaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteCoach = async (coach: Coach) => {
    const prompt = window.confirm(`Är du säker på att du vill ta bort coachen ${coach.firstName} ${coach.lastName}? Detta kan inte ångras.`);
    if (!prompt) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }
    try {
      const response = await fetch('https://localhost:5001/api/delete-coach', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: coach.email })
      });
      if (!response.ok) {
        throw new Error(`Failed to delete coach: ${response.status}`);
      }
      // Refetch coaches after deletion
      await fetchCoaches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addCoach = async ({firstName, lastName, email}: {firstName: string, lastName: string, email: string}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/add-coach', {
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
      // Refetch coaches after adding a new coach
      await fetchCoaches();
      setAddNewCoachForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getNewCoachInputs = () => {
    const firstNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Förnamn"]') as HTMLInputElement).value.trim();
    const lastNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Efternamn"]') as HTMLInputElement).value.trim();
    const emailInput = (document.querySelector('.add-user-name-inputs input[placeholder="Email"]') as HTMLInputElement).value.trim();
    return { firstName: firstNameInput, lastName: lastNameInput, email: emailInput };
  }

  const showAdddNewUserForm = () => {
    if (addNewCoachForm) {
      return (
        <div className="add-user-form">
          <div className="add-user-name-inputs">
            <input type="text" placeholder="Förnamn"  required/>
            <input type="text" placeholder="Efternamn" required/>
            <input type="email" placeholder="Email" required/>
          </div>
          <div className="add-user-buttons">
            <button className='user-button' onClick={() => addCoach(getNewCoachInputs())}>Lägg till</button>
            <button className='user-button' onClick={() => setAddNewCoachForm(false)}>Avbryt</button>
          </div>
        </div>
      )
    }
    else return (
      <button className='user-button' onClick={() => setAddNewCoachForm(!addNewCoachForm)}>Lägg till ny</button>
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
            {activeCoaches.length === 0 ? (
              <tr>
                <td colSpan={3}>No active coaches found.</td>
              </tr>
            ) : (
              activeCoaches.map((coach, index) => (
                <tr key={index}>
                  <td>{coach.firstName} {coach.lastName}</td>
                  <td>{coach.email}</td>
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => changeActiveStatus(coach)}>Inaktivera</button>                    
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
            {inactiveCoaches.length === 0 ? (
              <tr>
                <td colSpan={3}>No inactive coaches found.</td>
              </tr>
            ) : (
              inactiveCoaches.map((coach, index) => (
                <tr key={index}>
                  <td>{coach.firstName} {coach.lastName}</td>
                  <td>{coach.email}</td>
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => changeActiveStatus(coach)}>Aktivera</button>
                    <button className="delete-button" onClick={() => deleteCoach(coach)}>✕</button>
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

export default ManageCoaches;