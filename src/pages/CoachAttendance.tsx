import React from "react";
import { useState } from "react";
import './CoachAttendance.css';
import '../styles/spinner.css';
import { useUser } from "../context/UserContext";
import type UserType from "../Types/User";
import type AttendanceType from "../Types/Attendance";
import { useUsers, useUpdateUser } from "../hooks/useUsers";
import { useAttendance, useGetWeek } from "../hooks/useAttendance";
import { useNoClasses } from "../hooks/useNoClass";
import Toast from "../utils/toastMessage";


const CoachAttendance: React.FC = () => {
    const { userId } = useUser();
    const [date, setDate] = useState<Date>(new Date());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const { data: users = [] as UserType[], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isFetching: isUsersFetching } = useUsers();
    const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 2);
    const { data: noClasses = [] as Date[], isLoading: isNoClassesLoading, isError: isNoClassesError, error: noClassesError, refetch: refetchNoClasses, isRefetching: isNoClassesRefetching } = useNoClasses();
    const updateUserMutation = useUpdateUser();
    const { data: week } = useGetWeek(date, 2);

    const isLoading = isUsersLoading || isAttendanceLoading || isNoClassesLoading;
    const isError = isUsersError || isAttendanceError || isNoClassesError;
    const isFetching = isUsersFetching || isAttendanceRefetching || isNoClassesRefetching;

    const refetch = () => {
      if (isUsersError) refetchUsers();
      if (isAttendanceError) refetchAttendance();
      if (isNoClassesError) refetchNoClasses();
    }


    const handleUpdateUser = (user: UserType, update: boolean) => {
        if (!selectedUser) return;

        updateUserMutation.mutate(user, {
          onSuccess: () => {
            setToastMessage(`${update ? 'Användaren uppdaterad' : 'Schemat uppdaterat'}!`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        });
    }


    const changeWeek = (change: boolean) => {
      setDate(new Date(date.setDate(date.getDate() + (change ? 14 : -14))));
    }


    const getDate = (offset: number): Date => {
      const today = new Date();
      const monday = new Date(date);
      const dayOfWeek = today.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;  // Treat Sunday as 7
      monday.setDate(monday.getDate() - adjustedDay + offset);
      return monday;
    };


    const compareDates = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }


  const styleAttendanceButtons = (user: UserType, date: Date): string => {
    const isNoClass = noClasses.filter(d => compareDates(new Date(d), date)).length > 0;
    if (isNoClass) return " noclass";
    const result = attendance.filter(x => x.userId === user.id).filter(dates => dates.date.some(d => compareDates(new Date(d), date))
    ).length > 0;
    return result ? " attended" : "";
  };

  const dateFormatted = (date: Date): string => date.toLocaleDateString('sv-SE', {  day: 'numeric', month: 'short' });

  const checkInitials = (user: UserType): string => {
    const initials = users.filter(x => x.authLevel === 4 && x.coachId === userId && x.id !== user.id).map(u => u.firstName[0] + u.lastName[0]);
    if (initials.includes(user.firstName[0] + user.lastName[0])) {
      return `${user.firstName.slice(0,2)}.${user.lastName.slice(0,2)}`;
    }
    return `${user.firstName[0]}.${user.lastName[0]}`;
  }

  return (
    <div>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : isError ? (
        <div className="error-container">
          <p>{usersError?.message || attendanceError?.message || noClassesError?.message}</p>
          <button className="retry-button" onClick={() => {refetch()}} disabled={isFetching}>{isFetching ? 'Laddar...' : 'Försök igen'}</button>
        </div>
      ) : (
      <div className="attendence-container">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <div className="coach-attendance-header">
            <h2>Närvarosida</h2>
              <div className="header-controls">
                  <div className='navbar'>
                      <select id="user-dropdown" value={selectedUserId} onChange={(e) => { setSelectedUserId(Number(e.target.value)); setSelectedUser(users.find(u => u.id === Number(e.target.value)) || null); }}>
                          <option value="0">Alla deltagare</option>
                          {users.filter(user => user.authLevel === 4 && user.coachId === userId).map(user => (
                            <option key={user.id} value={user.id}>
                              {checkInitials(user)}
                          </option>
                          ))}
                      </select>
                  </div>
                  <div className="week-picker">
                    <button className="prev-week-button" onClick={() => changeWeek(false)}>&lt;</button>
                    <p className="week-select">{week}</p>
                    <button className="next-week-button" onClick={() => changeWeek(true)}>&gt;</button>
                  </div>
              </div>
              {selectedUserId !== 0 && 
              <div className="scheduled-days-section">
                <div className="header-info"><h2>Schemalagda dagar</h2><span>- Du kan ändra själv. Blå färg betyder att deltagaren är tänkt att delta den dagen.</span></div>
                <div className="attendence-table">
                  <table>
                    <thead>
                      <tr>
                          <th>Pass</th>
                          <th>Måndag</th>
                          <th>Tisdag</th>
                          <th>Onsdag</th>
                          <th>Torsdag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Förmiddag</td>
                        <td><button onClick={() => {

                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledMonAm: !selectedUser.scheduledMonAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledMonAm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledTueAm: !selectedUser.scheduledTueAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledTueAm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledWedAm: !selectedUser.scheduledWedAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledWedAm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledThuAm: !selectedUser.scheduledThuAm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledThuAm ? " attended" : "")} ></button></td>  
                        </tr>
                      <tr>
                        <td>Eftermiddag</td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledMonPm: !selectedUser.scheduledMonPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledMonPm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledTuePm: !selectedUser.scheduledTuePm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledTuePm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledWedPm: !selectedUser.scheduledWedPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledWedPm ? " attended" : "")} ></button></td>
                        <td><button onClick={() => {
                          if (!selectedUser) return;
                          const updated = {...selectedUser, scheduledThuPm: !selectedUser.scheduledThuPm};
                          setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent' + (users.find(u => u.id === selectedUserId)?.scheduledThuPm ? " attended" : "")} ></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            </div>}


            <div className="legend-container">
              <div className="week-picker">
                <button className="attended"></button>
                <span>Närvaro</span>
              </div>
              <div className="week-picker">
                <button className="absent"></button>
                <span>Frånvaro</span>
              </div>
              <div className="week-picker">
                <button className="noclass"></button>
                <span>Ingen lektion</span>
              </div>
            </div>
        </div>
        <div className="coach-table">
          <div className="attendence-table">
            <table>
                  <thead>
                    <tr>
                        <th>Namn</th>
                        <th><div className="date-header"><span>Måndag</span> {dateFormatted(getDate(-6))}</div></th>
                        <th><div className="date-header"><span>Tisdag</span> {dateFormatted(getDate(-5))}</div></th>
                        <th><div className="date-header"><span>Onsdag</span> {dateFormatted(getDate(-4))}</div></th>
                        <th><div className="date-header"><span>Torsdag</span> {dateFormatted(getDate(-3))}</div></th>
                        <th><div className="date-header"><span>Måndag</span> {dateFormatted(getDate(1))}</div></th>
                        <th><div className="date-header"><span>Tisdag</span> {dateFormatted(getDate(2))}</div></th>
                        <th><div className="date-header"><span>Onsdag</span> {dateFormatted(getDate(3))}</div></th>
                        <th><div className="date-header"><span>Torsdag</span> {dateFormatted(getDate(4))}</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.filter(x=> x.authLevel === 4 && x.coachId === userId && (selectedUserId !== 0 ? x.id === selectedUserId : true)).map((item, i) => (
                      <tr key={i}>
                        <td>{checkInitials(item)}</td>
                        {Array.from({ length: 8 }).map((_ : any, index: any) =>
                          { return (
                          <td>
                            <button key={index} className={'absent' + styleAttendanceButtons(item, getDate(index +1-7))} ></button>
                          </td> );
                          })
                        }
                      </tr>
                    ))}
                  </tbody>
              </table>
          </div>
        </div>
      </div>)}
    </div>
  );
}

  export default CoachAttendance;