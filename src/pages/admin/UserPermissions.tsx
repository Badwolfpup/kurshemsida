
import React, { useState, useEffect} from 'react';
import { useFetchUserPermissions } from '../../hooks/useFetchUserPermissions';
import { useFetchActiveUsers } from '../../hooks/useFetchActiveUsers';
import '../../styles/button.css'
import './UserPermissions.css';


const UserPermissions: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const activeUsers = useFetchActiveUsers(setError);
  const {userPermissions, loading, } = useFetchUserPermissions(selectedEmail, true, setError);
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({});


  useEffect(() => {
    setNewPermissions({...userPermissions});
  }, [userPermissions]);

 
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
        <select id="user-dropdown" value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)}>
          <option value="">Välj användare</option>
          {activeUsers.map(user => (
            <option key={user.email} value={user.email}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        <button className="user-button" onClick={savePermissions}>Spara</button>
        <button className="user-button" onClick={undoPermissions}>Ångra</button>
      </div>
      {selectedEmail && (
        <div className='permissions-container'>
          <h3>Kurser</h3>
          <div className='courses-list'>
            <label>HTML </label> <input id="html" type="checkbox" checked={newPermissions.hasOwnProperty("html") ? newPermissions["html"] : true} onChange={checkboxChanged} />
            <label>CSS</label> <input id="css" type="checkbox" checked={newPermissions.hasOwnProperty("css") ? newPermissions["css"] : true} onChange={checkboxChanged} />
            <label>JavaScript</label><input id="javascript" type="checkbox" checked={newPermissions.hasOwnProperty("javascript") ? newPermissions["javascript"] : true} onChange={checkboxChanged} />
          </div>
        </div>
      )}
      <br/>
      {selectedEmail && (
        <div className='permissions-container'>
          <h3>JavaScript Moduler</h3>
          <div className='courses-list'>
            {newPermissions.hasOwnProperty("javascript") && newPermissions["javascript"] && (
              <>
                <label>Variabler</label> <input id="variable" type="checkbox" checked={newPermissions.hasOwnProperty("variable") ? newPermissions["variable"] : true} onChange={checkboxChanged} />
                <label>Villkor</label> <input id="conditionals" type="checkbox" checked={newPermissions.hasOwnProperty("conditionals") ? newPermissions["conditionals"] : true} onChange={checkboxChanged} />
                <label>Loopar</label> <input id="loops" type="checkbox" checked={newPermissions.hasOwnProperty("loops") ? newPermissions["loops"] : true} onChange={checkboxChanged} />
                <label>Funktioner</label> <input id="functions" type="checkbox" checked={newPermissions.hasOwnProperty("functions") ? newPermissions["functions"] : true} onChange={checkboxChanged} />
                <label>Arrayer</label> <input id="arrays" type="checkbox" checked={newPermissions.hasOwnProperty("arrays") ? newPermissions["arrays"] : true} onChange={checkboxChanged} />
                <label>Objekt</label> <input id="objects" type="checkbox" checked={newPermissions.hasOwnProperty("objects") ? newPermissions["objects"] : true} onChange={checkboxChanged} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
