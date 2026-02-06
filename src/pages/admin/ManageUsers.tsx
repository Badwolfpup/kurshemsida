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
  const [showActiveUsers, setShowActiveUsers] = useState<boolean>(true);
  const [addNewUserForm, setAddNewUserForm] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("4");
  const [selectedRoleName, setSelectedRoleName] = useState<string>("deltagare");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { data: users = [] as UserType[], isLoading, isError, error, refetch, isRefetching } = useUsers(1);
  const { data: inactiveUsers = [] as UserType[], refetch: refetchInactiveUsers, isLoading: isInactiveUsersLoading, isError: isInactiveUsersError, error: inactiveUsersError, isRefetching: isInactiveUsersRefetching } = useUsers(0);
  const addUserMutation = useAddUser();
  const updateActivityStatusMutation = useUpdateActivityStatus();
  const deleteUserMutation = useDeleteUser();


  const handleEditUser = (user: UserType) => {
    navigate('/userprofile', { state: { selectedUser: user } });
  };


  const getNewUserInputs = () => {
    const firstNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Förnamn"]') as HTMLInputElement).value.trim();
    const lastNameInput = (document.querySelector('.add-user-name-inputs input[placeholder="Efternamn"]') as HTMLInputElement).value.trim();
    const emailInput = (document.querySelector('.add-user-name-inputs input[placeholder="Email"]') as HTMLInputElement).value.trim();
    const telephoneInput = (document.querySelector('.add-user-name-inputs input[placeholder="Telefon (valfritt)"]') as HTMLInputElement).value.trim();
    const authLevelEl = (document.querySelector('.role-combobox') as HTMLSelectElement);
    const authLevelInput = authLevelEl ? parseInt(authLevelEl.value) : 4;
    const startDateEl = (document.querySelector('.add-user-name-inputs input[placeholder="Startdatum"]') as HTMLInputElement);
    const startDateInput = startDateEl && startDateEl.value ? new Date(startDateEl.value) : null;

    const coachIdEl = document.querySelector('.coach-combobox') as HTMLSelectElement;
    const coachIdInput = coachIdEl && coachIdEl.value ? parseInt(coachIdEl.value) : null;
    const courseEl = document.querySelector('.course-combobox') as HTMLSelectElement;
    const courseInput = courseEl && courseEl.value ? parseInt(courseEl.value) : null;
    const contactIdEl = document.querySelector('.contact-combobox') as HTMLSelectElement;
    const contactIdInput = contactIdEl && contactIdEl.value ? parseInt(contactIdEl.value) : null;
    return { firstName: firstNameInput, lastName: lastNameInput, email: emailInput, startDate: startDateInput, telephone: telephoneInput, authLevel: authLevelInput, coachId: coachIdInput,  course: courseInput, contactId: contactIdInput } as AddUserDto;
  }


  const addCoachComboBox = (): React.ReactNode => {
        return (
            <select name='coachId' id="coachId" className="standard-select">
              <option value="">Välj coach (valfritt)</option>
              {users.length > 0 ? (
                users.filter(user => user.authLevel === 3 && user.isActive).map((coach) => (
                  <option key={coach.email} value={coach.id || ""}>
                    {`${coach.firstName} ${coach.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
        );
  }

    const addContactComboBox = (): React.ReactNode => {
        return (
          <select  name='contactId' id="contactId" className="standard-select">
              <option value="">Välj kontakt (valfritt)</option>
              {users.length > 0 ? (
                users.filter(user => user.authLevel <= 2 && user.isActive).map((teacher) => (
                  <option key={teacher.email} value={teacher.id || ""}>
                    {`${teacher.firstName} ${teacher.lastName}`}
                  </option>
                ))
              ) : null}
            </select>
        );
  }

    const addCourseComboBox = (): React.ReactNode => {
        return (
            <select name='course' id="course" className="standard-select">
              <option value="" disabled>Välj spår</option>
              <option value="1">Spår 1</option>
              <option value="2">Spår 2</option>
              <option value="3">Spår 3</option>
            </select>
        );
  }

    const addRoleComboBox = (): React.ReactNode => {
        return (
            <select name='authLevel' id="authLevel" className="standard-select" required value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value);}}>
              <option value="" disabled>Välj roll</option>
              {userType === "Admin" ? <option value="1">Admin</option> : null}
              <option value="2">Lärare</option>
              <option value="3">Coach</option>
              <option value="4">Deltagare</option>
            </select>
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
    const prevBtnEl = document.querySelector('.selected-btn') as HTMLButtonElement
    const btnEl = e.target as HTMLButtonElement
    if (prevBtnEl && prevBtnEl !== btnEl) {
      prevBtnEl.classList.toggle('selected-btn');
      btnEl.classList.toggle('selected-btn'); 
    }
    else if (!prevBtnEl) {
      btnEl.classList.toggle('selected-btn'); 
    }
    setSelectedRoleName(btnEl.textContent ? (btnEl.textContent === 'Coach' ? 'coacher' : btnEl.textContent.toLowerCase()) : "");
    setSelectedRole(role.toString());
  }


  const handleDeleteUser = async (user: UserType) => {
    try {
      await deleteUserMutation.mutateAsync({ id: user.id, firstName: user.firstName, lastName: user.lastName } as DeleteUserDto);
      setToastMessage('Användare raderad framgångsrikt!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage('Kunde inte radera användare. Försök igen senare.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
  }

  const handleUserActivityStatus = async (id: number) => {
    try {
      await updateActivityStatusMutation.mutate(id);
      setToastMessage(`Användarens aktivitet uppdaterad framgångsrikt!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage(`Kunde inte uppdatera användarens aktivitet. Försök igen senare.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
  }
   
  const handleAddUser = async () => {
    const newUserInputs = getNewUserInputs();
    addUserMutation.mutate(newUserInputs);
  }

    if (isLoading || isInactiveUsersLoading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Laddar användare...</p>
    </div>
  );

  if (isError || isInactiveUsersError) return (
    <div className="error-container">
      <p>{error?.message || inactiveUsersError?.message}</p>
      <button className="retry-button" onClick={() => {refetch(); refetchInactiveUsers();}} disabled={isRefetching || isInactiveUsersRefetching}>{(isRefetching || isInactiveUsersRefetching) ? 'Laddar...' : 'Försök igen'}</button>
    </div>
  );

  return (

    <div className="page-main" >
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="page-header">
        <div className='filter-buttons'>
          {userType === "Admin" && <button id="admin-button" className='standard-btn' onClick={async (e) => {changeRole(e, 1)}}>Admin</button>}
          {userType === "Admin" && <button id="teacher-button" className='standard-btn' onClick={async (e) => {changeRole(e, 2)}}>Lärare</button>}
          <button id="coach-button" className='standard-btn' onClick={async (e) => {changeRole(e, 3)}}>Coach</button>
          <button id="student-button" className='selected-btn standard-btn' onClick={async (e) => {changeRole(e, 4)}}>Deltagare</button>
          <h2>{`${showActiveUsers ? "Aktiva" : "Inaktiva"} ${selectedRoleName}`}</h2>
          <button className='greyed-btn ' onClick={() => {refetchInactiveUsers(); setShowActiveUsers(!showActiveUsers);}}>Se {showActiveUsers ? "Inaktiva" : "Aktiva"}</button>
        </div>
        {addNewUserForm ? 
        (
          <div>
            <div className="flex-wrap-horizontal-center add-margin-bottom">
              <input className='standard-input' type="text" name='firstName' id="firstName" placeholder="Förnamn"  required/>
              <input className='standard-input' type="text" name='lastName' id="lastName" placeholder="Efternamn" required/>
              <input className='standard-input' type="email" name='email' id="email" placeholder="Email" required/>
              <input className='standard-input' type="date" name='startDate' id="startDate" placeholder="Startdatum" />
              <input className='standard-input' type="tel" name='telephone' id="telephone" placeholder="Telefon (valfritt)" />
              {addRoleComboBox()}
              {selectedRole === "4" && addCourseComboBox()}
              {selectedRole === "4" && addCoachComboBox()}
              {selectedRole === "4" && addContactComboBox()}
            </div>
            <div className="flex-horizontal-center">
              <button className='standard-btn' onClick={() => {handleAddUser();  setSelectedRole("4"); setAddNewUserForm(false);}}>Lägg till</button>
              <button className='standard-btn' onClick={() => {setAddNewUserForm(false); setSelectedRole("4")}}>Avbryt</button>
            </div>
          </div>
        ) :
          (<button className='standard-btn' onClick={ async () => setAddNewUserForm(true)}>Lägg till ny</button>)        
        }
      </div>
      <div className="page-content">
        <div className='page-table-wrapper'>
          <table className="page-table">
            <thead>
              <tr>
                <th>Namn</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Startdatum</th>
                {selectedRole === "4" && <th>Kurs</th>}
                <th>Roll</th>
                {selectedRole === "4" && <th>Coach</th>}
                {selectedRole === "4" && <th>Kontakt</th>}
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {(showActiveUsers ? users : inactiveUsers).filter(user => user.authLevel === parseInt(selectedRole)).length === 0 ? (
                <tr>
                  <td colSpan={9}>Inga {showActiveUsers ? "aktiva" : "inaktiva"} användare hittades.</td>
                </tr>
              ) : (
                (showActiveUsers ? users : inactiveUsers).filter(user => user.authLevel === parseInt(selectedRole)).map((user, index) => (
                  <tr key={index}>
                          <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{user.telephone || ""}</td>
                    {selectedRole === "4" && <td>{user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : ""}</td>}
                    {selectedRole === "4" && <td>{user.course}</td>}
                    <td>{getRole(user.authLevel)}</td>
                    {selectedRole === "4" && <td>{getCoachName(user.coachId)}</td>}
                    {selectedRole === "4" && <td>{getContactName(user.contactId)}</td>}
                    <td className='flex-horizontal-center'>
                      <button className={`standard-btn ` + (!showActiveUsers ? 'delete-btn' : '')} onClick={() => showActiveUsers ? handleEditUser(user) : handleDeleteUser(user)}>{showActiveUsers ? "✏️" : "✕"}</button>
                      <button className="standard-btn" onClick={() => {user.isActive = !user.isActive; handleUserActivityStatus(user.id)}}>{showActiveUsers ? "Inaktivera" : "Aktivera"}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;