
import React, { useState, useEffect} from 'react';
import getPermissions from '../../data/FetchPermissions';
import '../../styles/button.css'
import './UserPermissions.css';

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

interface Permissions {
  userId: number;
  html: boolean;
  css: boolean;
  javascript: boolean;
  variable: boolean;
  conditionals: boolean;
  loops: boolean;
  functions: boolean;
  arrays: boolean;
  objects: boolean;
}

const defaultPermissions: Permissions = {
  userId: 0,
  html: false,
  css: false,
  javascript: false,
  variable: false,
  conditionals: false,
  loops: false,
  functions: false,
  arrays: false,
  objects: false
};

const UserPermissions: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permissions>(defaultPermissions);


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchPermissions = async (email: string) => {
    if (!email) {
      setUserPermissions(defaultPermissions);
      return;
    }
    try {
      const data: Permissions = await getPermissions(email) as Permissions;
      if (!data) {
        setUserPermissions(defaultPermissions);
        return;
      }
      setUserPermissions(data);
      console.log(`Email: ${email}`, data);
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const fetchUsers = async () => {
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
      let data = await response.json() as User[];
      data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      data = data.filter(user => user.isActive && user.authLevel === 4);
      setActiveUsers(data);
    }
    catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }
 
  const checkboxChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    const newPermissions = { ...userPermissions, [id]: checked };
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found.');
      return;
    }
    try {
      const response = await fetch(`/api/update-user-permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPermissions)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Permissions updated successfully');
      fetchPermissions(activeUsers.find(user => user.id === newPermissions.userId)?.email || '');
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <div className='permission-main-container'>
      <div className='navbar'>
        <select id="user-dropdown" onChange={(e) => fetchPermissions(e.target.value)}>
          <option value="">Välj användare</option>
          {activeUsers.map(user => (
            <option key={user.email} value={user.email}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </div>
      {userPermissions.userId !== 0 && (
        <div className='permissions-container'>
          <h3>Kurser</h3>
          <div className='courses-list'>
            <label>HTML </label> <input id="html" type="checkbox" checked={userPermissions.html} onChange={checkboxChanged} />
            <label>CSS</label> <input id="css" type="checkbox" checked={userPermissions.css} onChange={checkboxChanged} />
            <label>JavaScript</label><input id="javascript" type="checkbox" checked={userPermissions.javascript} onChange={checkboxChanged} />
          </div>
        </div>
      )}
      <br/>
      {userPermissions.userId !== 0 && (
        <div className='permissions-container'>
          <h3>JavaScript Moduler</h3>
          <div className='courses-list'>
            {userPermissions.hasOwnProperty("javascript") && userPermissions["javascript"] && (
              <>
                <label>Variabler</label> <input id="variable" type="checkbox" checked={userPermissions.hasOwnProperty("variable") ? userPermissions["variable"] : true} onChange={checkboxChanged} />
                <label>Villkor</label> <input id="conditionals" type="checkbox" checked={userPermissions.hasOwnProperty("conditionals") ? userPermissions["conditionals"] : true} onChange={checkboxChanged} />
                <label>Loopar</label> <input id="loops" type="checkbox" checked={userPermissions.hasOwnProperty("loops") ? userPermissions["loops"] : true} onChange={checkboxChanged} />
                <label>Funktioner</label> <input id="functions" type="checkbox" checked={userPermissions.hasOwnProperty("functions") ? userPermissions["functions"] : true} onChange={checkboxChanged} />
                <label>Arrayer</label> <input id="arrays" type="checkbox" checked={userPermissions.hasOwnProperty("arrays") ? userPermissions["arrays"] : true} onChange={checkboxChanged} />
                <label>Objekt</label> <input id="objects" type="checkbox" checked={userPermissions.hasOwnProperty("objects") ? userPermissions["objects"] : true} onChange={checkboxChanged} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
