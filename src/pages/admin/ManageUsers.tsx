import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';
import '../../styles/button.css';
import '../../styles/spinner.css';
import { useUser } from '../../context/UserContext';
import Toast from '../../utils/toastMessage';
import { useUsers, useAddUser, useUpdateActivityStatus, useDeleteUser } from '../../hooks/useUsers';
import type UserType from '../../Types/User';
import type { AddUserDto, DeleteUserDto } from '../../Types/Dto/UserDto';



const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const {userType} = useUser();
  const [addNewUserForm, setAddNewUserForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("4");
  const [selectedRoleName, setSelectedRoleName] = useState<string>("deltagare");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { data: users = [] as UserType[], isLoading, isError, error, refetch, isRefetching } = useUsers();
  const addUserMutation = useAddUser();
  const updateActivityStatusMutation = useUpdateActivityStatus();
  const deleteUserMutation = useDeleteUser();


  const handleEditUser = (user: UserType) => {
    navigate('/userpermissions', { state: { selectedUser: user } });
  };

  // const changeToAddedUserView = (role: number) => {
  //   var authLevel = role === 2 ? "teacher" : role === 3 ? "coach" : "student";
  //   var selectedBtn = document.querySelector('.role-button-selected') as HTMLButtonElement;
  //   if (selectedBtn && !selectedBtn.id.includes(authLevel)) {
  //     selectedBtn.classList.remove('role-button-selected');
  //     selectedBtn.classList.add('role-button');
  //     var newSelectedBtn = document.getElementById(`${authLevel}-button`) as HTMLButtonElement;
  //     newSelectedBtn.classList.remove('role-button');
  //     newSelectedBtn.classList.add('role-button-selected');

  //   }
  // }

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
    const teacherIdEl = document.querySelector('.teacher-combobox') as HTMLSelectElement;
    const contactIdInput = teacherIdEl && teacherIdEl.value ? parseInt(teacherIdEl.value) : null;
    return { firstName: firstNameInput, lastName: lastNameInput, email: emailInput, authLevel: authLevelInput, coachId: coachIdInput,  course: courseInput, contactId: contactIdInput } as AddUserDto;
  }


  const addCoachComboBox = (): React.ReactNode => {
        return (
          <div className="combobox-wrapper">
            <select name='coachId' id="coachId" className="coach-combobox">
              <option value="">Välj coach (valfritt)</option>
              {users.length > 0 ? (
                users.filter(user => user.authLevel === 3 && user.isActive).map((coach) => (
                  <option key={coach.email} value={coach.id || ""}>
                    {`${coach.firstName} ${coach.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
          </div>
        );
  }

    const addTeacherComboBox = (): React.ReactNode => {
        return (
          <div className="combobox-wrapper">
            <select name='teacherId' id="teacherId" className="coach-combobox">
              <option value="">Välj lärare (valfritt)</option>
              {users.length > 0 ? (
                users.filter(user => user.authLevel <= 2 && user.isActive).map((teacher) => (
                  <option key={teacher.email} value={teacher.id || ""}>
                    {`${teacher.firstName} ${teacher.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
          </div>
        );
  }

    const addCourseComboBox = (): React.ReactNode => {
        return (
          <div className="combobox-wrapper">
            <select name='course' id="course" className="course-combobox">
              <option value="" disabled>Välj spår</option>
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
            <select name='authLevel' id="authLevel" className="role-combobox" required value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value);}}>
              <option value="" disabled>Välj roll</option>
              {userType === "Admin" ? <option value="1">Admin</option> : null}
              <option value="2">Lärare</option>
              <option value="3">Coach</option>
              <option value="4">Deltagare</option>
            </select>
          </div>
        );
  }



  const getCoachName = (coachId?: number | null): string => {
    if (!coachId) return '';
    const coach = users.find(user => user.id === coachId);
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

  const getContactName = (contactId?: number | null): string => {
    if (!contactId) return '';
    const contact = users.find(user => user.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : '';
  }

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
    setSelectedRole(role.toString());
  }


  const handleDeleteUser = async (user: UserType) => {
    try {
      await deleteUserMutation.mutateAsync({ id: user.id, firstName: user.firstName, lastName: user.lastName } as DeleteUserDto);
      setToastMessage('Användare raderad framgångsrikt!');
    } catch (err) {
      setToastMessage('Kunde inte radera användare. Försök igen senare.');
      return;
    }
  }

  const handleUserActivityStatus = async (id: number) => {
    try {
      await updateActivityStatusMutation.mutate(id);
      setToastMessage(`Användarens aktivitet uppdaterad framgångsrikt!`);
    } catch (err) {
      setToastMessage(`Kunde inte uppdatera användarens aktivitet. Försök igen senare.`);
      return;
    }
  }
   
  const handleAddUser = async () => {
    const newUserInputs = getNewUserInputs();
    addUserMutation.mutate(newUserInputs);
  }

    if (isLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Laddar användare...</p>
    </div>
  );

  if (isError) return (
    <div className="error-container">
      <p>{error.message}</p>
      <button className="retry-button" onClick={() => {refetch()}} disabled={isRefetching}>{isRefetching ? 'Laddar...' : 'Försök igen'}</button>
    </div>
  );

  return (

    <div className="manage-users-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="header-section">
        <div className='filter-buttons'>
          {userType === "Admin" && <button id="teacher-button" className='role-button user-button' onClick={async (e) => {changeRole(e, 2)}}>Lärare</button>}
          <button id="coach-button" className='role-button user-button' onClick={async (e) => {changeRole(e, 3)}}>Coach</button>
          <button id="student-button" className='role-button-selected user-button' onClick={async (e) => {changeRole(e, 4)}}>Deltagare</button>
        </div>
        <h2>{`Aktiva ${selectedRoleName}`}</h2>
        {addNewUserForm ? 
        (
          <div className="add-user-form">
            <div className="add-user-name-inputs">
              <input type="text" name='firstName' id="firstName" placeholder="Förnamn"  required/>
              <input type="text" name='lastName' id="lastName" placeholder="Efternamn" required/>
              <input type="email" name='email' id="email" placeholder="Email" required/>
              {addRoleComboBox()}
              {selectedRole === "4" && addCourseComboBox()}
              {selectedRole === "4" && addCoachComboBox()}
              {selectedRole === "4" && addTeacherComboBox()}
            </div>
            <div className="add-user-buttons">
              <button className='user-button' onClick={() => {handleAddUser();  setSelectedRole("4"); setAddNewUserForm(false);}}>Lägg till</button>
              <button className='user-button' onClick={() => {setAddNewUserForm(false); setSelectedRole("4")}}>Avbryt</button>
            </div>
          </div>
        ) :
          (<button className='user-button' onClick={ async () => setAddNewUserForm(true)}>Lägg till ny</button>)        
        }
      </div>
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Namn</th>
              <th>Email</th>
              {selectedRole === "4" && <th>Kurs</th>}
              <th>Roll</th>
              {selectedRole === "4" && <th>Coach</th>}
              {selectedRole === "4" && <th>Kontakt</th>}
              <th>Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8}>No active users found.</td>
              </tr>
            ) : (
              users.filter(user => user.isActive && user.authLevel === parseInt(selectedRole)).map((user, index) => (
                <tr key={index}>
                        <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  {selectedRole === "4" && <td>{user.course}</td>}
                  <td>{getRole(user.authLevel)}</td>
                  {selectedRole === "4" && <td>{getCoachName(user.coachId)}</td>}
                  {selectedRole === "4" && <td>{getContactName(user.contactId)}</td>}
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => handleEditUser(user)}>✏️</button>
                    <button className="user-button" onClick={() => {user.isActive = !user.isActive; handleUserActivityStatus(user.id)}}>Inaktivera</button>
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
              {selectedRole === "4" && <th>Kurs</th>}
              <th>Roll</th>
              {selectedRole === "4" && <th>Coach</th>}
              {selectedRole === "4" && <th>Kontakt</th>}  
              <th>Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => !user.isActive && user.authLevel === parseInt(selectedRole)).length === 0 ? (
              <tr>
                <td colSpan={8}>No inactive users found.</td>
              </tr>
            ) : (
              users.filter(user => !user.isActive && user.authLevel === parseInt(selectedRole)).map((user, index) => (
                <tr key={index}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  {selectedRole === "4" && <td>{user.course}</td>}
                  <td>{getRole(user.authLevel)}</td>
                  {selectedRole === "4" && <td>{getCoachName(user.coachId)}</td>}
                  {selectedRole === "4" && <td>{getContactName(user.contactId)}</td>}
                  <td className='list-buttons'>
                    <button className="user-button" onClick={() => {user.isActive = !user.isActive; handleUserActivityStatus(user.id)}}>Aktivera</button>
                    <button className="delete-button" onClick={() => handleDeleteUser(user)}>✕</button>
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