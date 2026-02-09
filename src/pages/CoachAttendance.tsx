import React from "react";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import type UserType from "../Types/User";
import type AttendanceType from "../Types/Attendance";
import { useUsers, useUpdateUser } from "../hooks/useUsers";
import { useAttendance, useGetWeek } from "../hooks/useAttendance";
import { useNoClasses } from "../hooks/useNoClass";
import Toast from "../utils/toastMessage";


const CoachAttendance: React.FC = () => {
    const { userId, userType } = useUser();
    const [date, setDate] = useState<Date>(new Date());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [selectedCoachId, setSelectedCoachId] = useState<number>(0);
    const [showUserinfo, setShowUserInfo] = useState<boolean>(true);
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
      const offset = change ? 14 : -14;
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + offset);

      // Prevent navigating to future weeks
      if (change) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + 7);
        if (newDate >= nextMonday) return;
      }

      setDate(newDate);
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
    if (isNoClass) return " noclass-btn";
    const result = attendance.filter(x => x.userId === user.id).filter(dates => dates.date.some(d => compareDates(new Date(d), date))
    ).length > 0;
    return result ? " attended-btn" : "";
  };

  const dateFormatted = (date: Date): string => date.toLocaleDateString('sv-SE', {  day: 'numeric', month: 'short' });

  const checkInitials = (user: UserType): string => {
    const initials = users.filter(x => x.authLevel === 4 && x.coachId === userId && x.id !== user.id).map(u => u.firstName[0] + u.lastName[0]);
    if (initials.includes(user.firstName[0] + user.lastName[0])) {
      return `${user.firstName.slice(0,2)}.${user.lastName.slice(0,2)}`;
    }
    return `${user.firstName[0]}.${user.lastName[0]}`;
  }

  const getMonthName = (offset: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleString('sv-SE', { month: 'long' });
  }

  const getFirstDayOfMonth = (offset: number): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    date.setDate(1);
    date.setHours(0,0,0,0);
    return date;
  }

  const getLastDayOfMonth = (offset: number): Date => {
    if (offset === 0) return new Date();
    const date = new Date();
    date.setMonth(date.getMonth() + offset + 1);
    date.setDate(0);
    date.setHours(23,59,59,999);
    return date;
  }

  const getWeekday = (date: Date): string => date.toLocaleDateString('sv-SE', { weekday: 'long' });

  const attendsScheduledDay = (weekday: string): boolean => {
    if (!selectedUser) return false;
    if (weekday === 'måndag') return selectedUser.scheduledMonAm || selectedUser.scheduledMonPm;
    if (weekday === 'tisdag') return selectedUser.scheduledTueAm || selectedUser.scheduledTuePm;
    if (weekday === 'onsdag') return selectedUser.scheduledWedAm || selectedUser.scheduledWedPm;
    if (weekday === 'torsdag') return selectedUser.scheduledThuAm || selectedUser.scheduledThuPm;
    return false;
  }

  const getTotalScheduledDaysInMonth = (monthOffset: number): number => {
    if (!selectedUser) return 0;
    const firstday = getFirstDayOfMonth(monthOffset);
    const lastday = getLastDayOfMonth(monthOffset);
    let count = 0;
    for (let d = firstday; d <= lastday; d.setDate(d.getDate() + 1)) {
      if (attendsScheduledDay(getWeekday(d)) && !noClasses.some(nc => compareDates(new Date(nc), d)) && !!selectedUser.startDate && d >= new Date(selectedUser.startDate)) count++;
    }
    return count;
  }

  const printScheduledDays = (offset: number): string => {
    if (!selectedUser) return "";
    const attendedDays = attendance.filter(att => att.userId === selectedUser.id).reduce((acc, att) => acc + att.date.filter(d => {
      const attDate = new Date(d);
      const attendance = attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0);
      return attendance && attendsScheduledDay(getWeekday(attDate)) && !noClasses.some(nc => compareDates(new Date(nc), attDate)) && !!selectedUser.startDate && attDate >= new Date(selectedUser.startDate);
    }).length, 0);
    const totalScheduled = getTotalScheduledDaysInMonth(offset);
    return `${attendedDays} / ${totalScheduled} (${totalScheduled > 0 ? Math.round(attendedDays / totalScheduled * 100) : 0}%)`;
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
      <div className="page-main">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        <div className="page-header">
            <div className="flex-horizontal-center">  
              <h2 className="no-margin-onY">Närvarosida</h2>
              <select className="standard-select" id="user-dropdown" value={selectedUser?.id || 0} onChange={(e) => {setSelectedUserId(Number(e.target.value)); setSelectedUser(users.find(u => u.id === Number(e.target.value)) || null); }}>
                  <option value="0">Alla deltagare</option>
                  {users?.filter(user => (user.authLevel === 4 && (userType === 'Teacher' || userType === 'Admin') && user.coachId === selectedCoachId) || 
                  (user.authLevel === 4 && userType === 'Coach' && user.coachId === userId)).map((item, i) => (
                    <option key={i} value={item.id}>
                      {checkInitials(item)}
                  </option>
                  ))}
              </select>
              {(userType === 'Admin' || userType ==='Teacher') &&
                <select className="standard-select" value={selectedCoachId || 0} onChange={(e) => setSelectedCoachId(Number(e.target.value))} >
                  <option value="0">Alla coacher</option>
                  {users?.filter(user => user.authLevel === 3).map((coach, i) => (
                    <option key={i} value={coach.id}>
                      {coach.firstName} {coach.lastName}
                    </option>
                  ))}
                </select>}
            </div>
              {selectedUser && selectedUser?.id !== 0 && 
              <>
                <div className="flex-horizontal-center">

                  <div className="flex-column-center">
                     <div className="flex-horizontal-center">
                        <div className="page-table-wrapper center-table">
                          <h2 className="no-margin-onY">Schemalagda dagar</h2>
                          <span className="no-margin-onY">Du kan ändra själv. Blå färg betyder att deltagaren är tänkt att delta den dagen. Om ingen dag alls är ibockad betyder det att deltagaren inte har något överrenskommit schema.</span>
                          <div className="page-table">
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
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledMonAm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledTueAm: !selectedUser.scheduledTueAm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledTueAm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledWedAm: !selectedUser.scheduledWedAm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledWedAm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledThuAm: !selectedUser.scheduledThuAm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledThuAm ? " attended-btn" : "")} ></button></td>  
                                  </tr>
                                <tr>
                                  <td>Eftermiddag</td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledMonPm: !selectedUser.scheduledMonPm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledMonPm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledTuePm: !selectedUser.scheduledTuePm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledTuePm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledWedPm: !selectedUser.scheduledWedPm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledWedPm ? " attended-btn" : "")} ></button></td>
                                  <td><button onClick={() => {
                                    if (!selectedUser) return;
                                    const updated = {...selectedUser, scheduledThuPm: !selectedUser.scheduledThuPm};
                                    setSelectedUser(updated); handleUpdateUser(updated, false); }} className={'absent-btn' + (users.find(u => u.id === selectedUserId)?.scheduledThuPm ? " attended-btn" : "")} ></button></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      
                        <div className="page-table-wrapper center-table bottom-feeder">
                          {showUserinfo && (
                          <>
                            <div className="flex-horizontal">
                              <h2 className="no-margin-onY">Lärare på kursen</h2>
                              <button className="standard-btn width-150px right-aligned" onClick={() => setShowUserInfo(false)}>Statistik</button>
                            </div>
                            <span className="no-margin-onY">Grön färg är den lärare som ni primärt kontaktar angående elevuppföljning.</span>
                            <div className="page-table">
                              <table>
                                <thead>
                                  <tr>
                                      <th>Namn</th>
                                      <th>Telefonnummer</th>
                                      <th>Email</th>
                                  </tr>
                                </thead>
                                <tbody>
                                    {users?.filter(u => u.authLevel <= 2 && u.isActive && u.firstName !== 'Alexandra').map((contact) => (
                                      <tr key={contact.id}>
                                        <td style={{whiteSpace: 'nowrap'}} className={contact.id === selectedUser?.contactId ? "primary-contact" : ""}>{contact.firstName} {contact.lastName}</td>
                                        <td className={contact.id === selectedUser?.contactId ? "primary-contact" : ""}>{contact.telephone}</td>
                                        <td className={contact.id === selectedUser?.contactId ? "primary-contact" : ""}>{contact.email}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </>)}
                          {!showUserinfo && (
                          <>
                              <div className="flex-horizontal">
                                <h2 className="no-margin-onY">Statistik</h2>
                                <button className="standard-btn width-150px right-aligned" onClick={() => setShowUserInfo(true)}>Kontaktuppgifter</button>
                              </div>
                              <span className="no-margin-onY"><strong>Startdatum på kursen:</strong> {selectedUser?.startDate ? new Date(selectedUser.startDate).toLocaleDateString('sv-SE') : 'Ej angivet'}</span>
                              <span className="no-margin-onY "><strong>Senaste närvarodag:</strong> {(() => {
                                const dates = attendance.filter(x => x.userId == selectedUser.id).flatMap(a => a.date);
                                if (dates.length === 0) return 'Aldrig närvarat';
                                const latest = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
                                return new Date(latest).toLocaleDateString('sv-SE');
                              })()}</span>
                              <div className="page-table">
                              <table>
                                <thead>
                                  <tr>
                                      <th></th>
                                      <th>{getMonthName(0)}</th>
                                      <th>{getMonthName(-1)}</th>
                                      <th>{getMonthName(-2)}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                      <tr>
                                        <td>Antal närvarodagar:</td>
                                        <td>{attendance.filter(att => att.userId === selectedUser.id).reduce((acc, att) => acc + att.date.filter(d => {
                                              const attDate = new Date(d);
                                              return attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0) && !noClasses.some(nc => compareDates(new Date(nc), attDate)) && !!selectedUser.startDate && attDate >= new Date(selectedUser.startDate);
;
                                            }).length, 0)}
                                        </td>
                                        <td>{attendance.filter(att => att.userId === selectedUser.id).reduce((acc, att) => acc + att.date.filter(d => {
                                              const attDate = new Date(d);
                                              return attDate >= getFirstDayOfMonth(-1) && attDate <= getLastDayOfMonth(-1) && !noClasses.some(nc => compareDates(new Date(nc), attDate)) && !!selectedUser.startDate && attDate >= new Date(selectedUser.startDate);
                                            }).length, 0)}
                                        </td>
                                        <td>{attendance.filter(att => att.userId === selectedUser.id).reduce((acc, att) => acc + att.date.filter(d => {
                                              const attDate = new Date(d);
                                              return attDate >= getFirstDayOfMonth(-2) && attDate <= getLastDayOfMonth(-2) && !noClasses.some(nc => compareDates(new Date(nc), attDate)) && !!selectedUser.startDate && attDate >= new Date(selectedUser.startDate);
                                            }).length, 0)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Närvaro utifrån schema:</td>
                                        <td>{printScheduledDays(0)}</td> 
                                        <td>{printScheduledDays(-1)}</td> 
                                        <td>{printScheduledDays(-2)}</td> 
                                             
                                      </tr>
                                </tbody>
                              </table>
                            </div>
                          </>
                          )}
                        </div>


                    </div>
                  </div>
                </div>
            </>}
        </div>
        <div className="page-content">
          <div className="flex-column-center">
              <div className="flex-horizontal-center">
                <div className="flex-horizontal">
                  <button className="attended-btn"></button>
                  <span className="span-vertical-center">Närvaro</span>
                </div>
                <div className="flex-horizontal">
                  <button className="absent-btn"></button>
                  <span className="span-vertical-center">Frånvaro</span>
                </div>
                <div className="flex-horizontal">
                  <button className="noclass-btn"></button>
                  <span className="span-vertical-center">Ingen lektion</span>
                </div>
            </div>
          <div className="flex-horizontal-center">
            
            <div className="flex-horizontal">
              <button className="standard-btn" onClick={() => changeWeek(false)}>&lt;</button>
              <p className="span-title-center">{week}</p>
              <button className="standard-btn" onClick={() => changeWeek(true)}>&gt;</button>
            </div>
          </div>
          </div>
          <div className="page-table-wrapper">
            <table className="page-table">
                  <thead>
                    <tr>
                        <th>Namn</th>
                        <th><div className="flex-column-center"><span>Måndag</span> {dateFormatted(getDate(-6))}</div></th>
                        <th><div className="flex-column-center"><span>Tisdag</span> {dateFormatted(getDate(-5))}</div></th>
                        <th><div className="flex-column-center"><span>Onsdag</span> {dateFormatted(getDate(-4))}</div></th>
                        <th><div className="flex-column-center"><span>Torsdag</span> {dateFormatted(getDate(-3))}</div></th>
                        <th><div className="flex-column-center"><span>Måndag</span> {dateFormatted(getDate(1))}</div></th>
                        <th><div className="flex-column-center"><span>Tisdag</span> {dateFormatted(getDate(2))}</div></th>
                        <th><div className="flex-column-center"><span>Onsdag</span> {dateFormatted(getDate(3))}</div></th>
                        <th><div className="flex-column-center"><span>Torsdag</span> {dateFormatted(getDate(4))}</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.filter(x=> ((x.authLevel === 4 && x.coachId === selectedCoachId && (selectedUserId !== 0 ? x.id === selectedUserId : true) && (userType === 'Teacher' || userType === 'Admin')) ||
                    (x.authLevel === 4 && userType === 'Coach' && x.coachId === userId && (selectedUserId !== 0 ? x.id === selectedUserId : true))) && x.startDate && new Date(x.startDate) <= getDate(4)).map((item, i) => (
                      <tr key={i}>
                        <td>{checkInitials(item)}</td>
                        {Array.from({ length: 8 }).map((_ : any, index: any) =>
                          { return (
                          <td>
                            {item.startDate !== null && new Date(item.startDate) <= getDate(index +2-7) && <button key={index} className={'absent-btn' + styleAttendanceButtons(item, getDate(index +1-7))} ></button>}
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