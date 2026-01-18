import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';
import '../../styles/button.css';
import '../../styles/spinner.css';
import { useUser } from '../../context/UserContext';
import getUsers from '../../data/FetchUsers';
import Toast from '../../utils/toastMessage';
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

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addNewUserForm, setAddNewUserForm] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [btnText, setBtnText] = useState("Lägg till");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("4");
  const [selectedRoleName, setSelectedRoleName] = useState<string>("deltagare");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async (role: number) => {
    setLoading(true);
    setError(null);
    try {
      const data:  User[] | undefined = await getUsers();
      if (data) {
        data.sort((a, b) => a.firstName.localeCompare(b.firstName));
        setUserList(data);
        setActiveUsers(data.filter(user => user.isActive && user.authLevel === role));
        setInactiveUsers(data.filter(user => !user.isActive && user.authLevel === role));
      }
    } catch (err) {
      setError('Kunde inte ladda användare. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(4);
  }, []);

  const updateUser = async (user: User) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }
    console.log(user);
    try {
      const updateData = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          authLevel: user.authLevel,
          isActive: user.isActive,
          course: user.course,
          coachId: user.coachId
};
      console.log('Sending:', JSON.stringify(updateData));
      const response = await fetch(`/api/update-user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        throw new Error(`Failed to ${(user.isActive ? "inactivate" : "activate")} user: ${response.status}`);
      }
      // Refetch users after status change
      await fetchUsers(user.authLevel);
      setToastMessage(`Användare ${user.isActive ? 'inaktiverad' : 'aktiverad'} framgångsrikt!`);
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteUser = async (user: User) => {
    const prompt = window.confirm(`Är du säker på att du vill ta bort användaren ${user.firstName} ${user.lastName}? Detta kan inte ångras.`);
    if (!prompt) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.id })
      });
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
      // Refetch users after deletion
      await fetchUsers(user.authLevel);
      setToastMessage('Användare raderad framgångsrikt!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addUser = async ({firstName, lastName, email,  authLevel, coachId, course}: {firstName: string, lastName: string, email: string, authLevel: number, coachId: number | null,  course: number | null}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ FirstName: firstName, LastName: lastName, Email: email, CoachId: coachId, AuthLevel: authLevel, Course: course})
      });

      if (!response.ok) {
        console.log(response);
        throw new Error(`Failed to add user: ${response.status}`);
      }
      // Refetch users after adding a new user
      await fetchUsers(authLevel);
      setAddNewUserForm(false);
      changeToAddedUserView(authLevel);
      setToastMessage('Användare tillagd framgångsrikt!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditUser = (user: User) => {
    navigate('/userpermissions', { state: { selectedUser: user } });
  };

  const changeToAddedUserView = (role: number) => {
    var authLevel = role === 2 ? "teacher" : role === 3 ? "coach" : "student";
    var selectedBtn = document.querySelector('.role-button-selected') as HTMLButtonElement;
    if (selectedBtn && !selectedBtn.id.includes(authLevel)) {
      selectedBtn.classList.remove('role-button-selected');
      selectedBtn.classList.add('role-button');
      var newSelectedBtn = document.getElementById(`${authLevel}-button`) as HTMLButtonElement;
      newSelectedBtn.classList.remove('role-button');
      newSelectedBtn.classList.add('role-button-selected');

    }
  }

  const getNewUserInputs = () => {
    const firstNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Förnamn"]') as HTMLInputElement).value.trim();
    const lastNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Efternamn"]') as HTMLInputElement).value.trim();
    const emailInput = (document.querySelector('.add-user-name-inputs input[placeholder="Email"]') as HTMLInputElement).value.trim();
    const authLevelEl = (document.querySelector('.role-combobox') as HTMLSelectElement);
    const authLevelInput = authLevelEl ? parseInt(authLevelEl.value) : 4;

    const coachIdEl = document.querySelector('.coach-combobox') as HTMLSelectElement;
    const coachIdInput = coachIdEl && coachIdEl.value ? parseInt(coachIdEl.value) : null;
    const courseEl = document.querySelector('.course-combobox') as HTMLSelectElement;
    const courseInput = courseEl && courseEl.value ? parseInt(courseEl.value) : null;
    console.log(firstNameInput, lastNameInput, emailInput, authLevelInput, coachIdInput, courseInput);
    return { firstName: firstNameInput, lastName: lastNameInput, email: emailInput, authLevel: authLevelInput, coachId: coachIdInput,  course: courseInput };
  }


  const addCoachComboBox = (): React.ReactNode => {
    console.log('Rendering course combobox');
        return (
          <div className="combobox-wrapper">
            <select name='coachId' id="coachId" value={selectedUser?.coachId || selectedCoach} onChange={handleInputChange} className="coach-combobox">
              <option value="">Välj coach (valfritt)</option>
              {userList.length > 0 ? (
                userList.filter(user => user.authLevel === 3 && user.isActive).map((coach) => (
                  <option key={coach.email} value={coach.id || ""}>
                    {`${coach.firstName} ${coach.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
          </div>
        );
  }

    const addCourseComboBox = (): React.ReactNode => {
      console.log('Rendering course combobox');
        return (
          <div className="combobox-wrapper">
            <select name='course' id="course" value={selectedUser?.course} onChange={handleInputChange} className="course-combobox">
              <option value="">Välj spår</option>
              <option value="1">Spår 1</option>
              <option value="2">Spår 2</option>
              <option value="3">Spår 3</option>
            </select>
          </div>
        );
  }

    const addRoleComboBox = (): React.ReactNode => {
        return (
          <div className="combobox-wrapper" >
            <select name='authLevel' id="authLevel" className="role-combobox" required value={selectedUser?.authLevel || selectedRole} onChange={(e) => { handleInputChange(e); showStudentCombobox(e.target.value);}}>
              <option value="" disabled>Välj roll</option>
              {useUser().userType === "Admin" ? <option value="1">Admin</option> : null}
              <option value="2">Lärare</option>
              <option value="3">Coach</option>
              <option value="4">Deltagare</option>
            </select>
          </div>
        );
  }

  const showStudentCombobox = (value: string) => {
    setSelectedRole(value);
    if (value === "4" )  setIsStudent(true);
    else setIsStudent(false);
  }


  const showAddNewUserForm = () => {
    setSelectedUser(null);
    setAddNewUserForm(true);
    setBtnText("Lägg till");
  }

  const getCoachName = (coachId?: number | null): string => {
    if (!coachId) return '';
    const coach = userList.find(user => user.id === coachId);
    return coach ? `${coach.firstName} ${coach.lastName}` : '';
  }

  const getRole =(authLevel: number): string => {
    switch(authLevel) {
      case 1: return "Admin";
      case 2: return "Lärare";
      case 3: return "Coach";
      case 4: return "Deltagare";
      case 5: return "Gäst";
      default: return "Okänd";
    }
  }


  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Laddar användare...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button className="retry-button" onClick={() => fetchUsers(4)}>Försök igen</button>
    </div>
  );


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let parsedValue: any = value;
      if (name === 'coachId') {
        setSelectedCoach(userList.find(user => user.id === parseInt(value)) ? value : "");
      }
      if (type === 'number' || name === 'authLevel' || name === 'course' || name === 'coachId') {
          parsedValue = value ? parseInt(value) : null;
      }
      console.log(value);
      if (selectedUser !== null) setSelectedUser(selectedUser ? { ...selectedUser, [name]: parsedValue } : null);
  };

  const changeRole = (e: React.MouseEvent<HTMLButtonElement>, role: number) => {
    const prevBtnEl = document.querySelector('.role-button-selected') as HTMLButtonElement
    const btnEl = e.target as HTMLButtonElement
    if (prevBtnEl && prevBtnEl !== btnEl) {
      prevBtnEl.classList.remove('role-button-selected');
      prevBtnEl.classList.add('role-button');
      btnEl.classList.remove('role-button');
      btnEl.classList.add('role-button-selected'); 
    }
    else if (!prevBtnEl) {
      btnEl.classList.remove('role-button');
      btnEl.classList.add('role-button-selected'); 
    }
    setSelectedRoleName(btnEl.textContent ? (btnEl.textContent === 'Coach' ? 'coacher' : btnEl.textContent.toLowerCase()) : "");
    fetchUsers(role);
  }

  const showTeacherUsers = () => {
    if (useUser().userType === "Admin") return true;
    return false;
  }



  return (
    <div className="manage-users-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="header-section">
        <div className='filter-buttons'>
          {showTeacherUsers() && <button id="teacher-button" className='role-button user-button' onClick={async (e) => {changeRole(e, 2)}}>Lärare</button>}
          <button id="coach-button" className='role-button user-button' onClick={async (e) => {changeRole(e, 3)}}>Coach</button>
          <button id="student-button" className='role-button-selected user-button' onClick={async (e) => {changeRole(e, 4)}}>Deltagare</button>
        </div>
        <h2>{`Aktiva ${selectedRoleName}`}</h2>
        {addNewUserForm ? 
        (
          <div className="add-user-form">
            <div className="add-user-name-inputs">
              <input type="text" name='firstName' id="firstName" placeholder="Förnamn"  required value={selectedUser?.firstName} onChange={handleInputChange}/>
              <input type="text" name='lastName' id="lastName" placeholder="Efternamn" required value={selectedUser?.lastName} onChange={handleInputChange}/>
              <input type="email" name='email' id="email" placeholder="Email" required value={selectedUser?.email} onChange={handleInputChange}/>
              {addRoleComboBox()}
              {isStudent && addCourseComboBox()}
              {isStudent && addCoachComboBox()}
            </div>
            <div className="add-user-buttons">
              <button className='user-button' onClick={() => {addUser(getNewUserInputs()); setSelectedCoach(""); setSelectedRole("4"); setAddNewUserForm(false);}}>{btnText}</button>
              <button className='user-button' onClick={() => {setAddNewUserForm(false); setSelectedCoach(""); setSelectedRole("4")}}>Avbryt</button>
            </div>
          </div>
        ) :
          (<button className='user-button' onClick={ async () => {showAddNewUserForm()}}>Lägg till ny</button>)        
        }
      </div>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Namn</th>
              <th>Email</th>
              <th>Kurs</th>
              <th>Roll</th>
              <th>Coach</th>
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
                  <td>{user.course}</td>
                  <td>{getRole(user.authLevel)}</td>
                  <td>{getCoachName(user.coachId)}</td>
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => handleEditUser(user)}>✏️</button>
                    <button className="user-button" onClick={() => {user.isActive = !user.isActive; updateUser(user)}}>Inaktivera</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <br /><br />
      <h2>{`Inaktiva ${selectedRoleName}`}</h2>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Namn</th>
              <th>Email</th>
              <th>Kurs</th>
              <th>Roll</th>
              <th>Coach</th>
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
                  <td>{user.course}</td>
                  <td>{getRole(user.authLevel)}</td>
                  <td>{getCoachName(user.coachId)}</td>
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => {user.isActive = !user.isActive; updateUser(user)}}>Aktivera</button>
                    <button className="delete-button" onClick={() => deleteUser(user)}>✕</button>
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