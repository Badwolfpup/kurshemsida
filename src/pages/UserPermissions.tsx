
import React, { useState, useEffect, use} from 'react';
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
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({});
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
      getPermissionsForUser();
    }
    setLoading(false);
  }, [activeUsers]);

  useEffect(() => {
    setNewPermissions({...userPermissions});
  }, [userPermissions]);

  const getPermissionsForUser = async () => {
    const dropdown = document.getElementById("user-dropdown") as HTMLSelectElement;
    if (!dropdown) return;
    const selectedEmail = dropdown.value;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }
    try {
      const response = await fetch(`https://localhost:5001/api/fetch-user-permissions`, {
        method: 'POST',
        headers: {
          
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: selectedEmail })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: any[] = await response.json();
      setUserPermissions(data.length > 0 ? data[0] : {});
      console.log(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const checkboxChanged = ( e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setNewPermissions(prev => ({...prev, [id]: checked }));
  }

  const savePermissions = async () => {
    const changedKeys = Object.keys(newPermissions).filter(key => newPermissions[key] !== userPermissions[key]);
    if (changedKeys.length === 0) return; // No changes detected

    const dropdown = document.getElementById("user-dropdown") as HTMLSelectElement;
    if (!dropdown) return;
    const selectedEmail = dropdown.value;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    const changedPermissions = Object.fromEntries(changedKeys.map(key => [key, newPermissions[key]]));

    try {
      const response = await fetch(`https://localhost:5001/api/update-user-permissions`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Permissions: changedPermissions, Email: selectedEmail })
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
};

const undoPermissions = () => {
  setNewPermissions({...userPermissions});
}
  


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;  

  return (
    <div>
      <div className='navbar'>
        <select id="user-dropdown" onChange={() => getPermissionsForUser()}/>
        <button className="user-button" onClick={savePermissions}>Spara</button>
        <button className="user-button" onClick={undoPermissions}>Ångra</button>
      </div>
      <h3>Kurser</h3>
      <div className='courses-list'>
        <label>HTML </label> <input id="html" type="checkbox" checked={newPermissions.hasOwnProperty("html") ? newPermissions["html"] : true} onChange={checkboxChanged} />
        <label>CSS</label> <input id="css" type="checkbox" checked={newPermissions.hasOwnProperty("css") ? newPermissions["css"] : false} onChange={checkboxChanged} />
        <label>JavaScript</label><input id="javascript" type="checkbox" checked={newPermissions.hasOwnProperty("javascript") ? newPermissions["javascript"] : false} onChange={checkboxChanged} />
      </div>
    </div>
  );
};

export default UserPermissions;
