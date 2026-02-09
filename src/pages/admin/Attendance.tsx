import React from "react";
import { useState } from "react";
import type UserType from "../../Types/User";
import type AttendanceType  from "../../Types/Attendance";
import type {  UpdateAttendanceDto } from "../../Types/Dto/AttendanceDto";
import { useUsers } from "../../hooks/useUsers";
import { useNoClasses, useUpdateNoClasses } from "../../hooks/useNoClass";
import { useAttendance, useUpdateAttendance, useGetWeek } from "../../hooks/useAttendance";
import Toast from '../../utils/toastMessage';


const Attendance: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showStats, setShowStats] = useState<boolean>(false);
  const { data: users = [] as UserType[], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isRefetching: isUsersRefetching } = useUsers();
  const { data: noClasses = [] as Date[], isLoading: isNoClassesLoading, isError: isNoClassesError, error: noClassesError, refetch: refetchNoClasses, isRefetching: isNoClassesRefetching } = useNoClasses();
  const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 1);
  const { data: week } = useGetWeek(date, 1);
  const updateAttendanceMutation = useUpdateAttendance();
  const updateNoClassesMutation = useUpdateNoClasses();

  const changeWeek = (change: boolean) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + (change ? 7 : -7));
      setDate(newDate);
  }
  const dateFormatted = (date: Date): string => date.toLocaleDateString('sv-SE', {  day: 'numeric', month: 'short' });


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
    if (isNoClass) { return " noclass-btn"; }
    const result = attendance.filter(x => x.userId === user.id).filter(dates => dates.date.some(d => compareDates(new Date(d), date))
    ).length > 0;
    return result ? " attended-btn" : "";
  };

  const styleNoclassButtons = (date: Date): string => {
    const isNoClass = noClasses.filter(d => compareDates(new Date(d), date)).length > 0;
    return isNoClass ? " noclass-btn" : "";
  }

  const countAttendance = (date: Date): number => {
    return attendance.filter(att => att.date.some(d => compareDates(new Date(d), date))).length;
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

  const numberOfWeekdaysInMonth = (weekday: number, month: number, year: number): number => {
    // weekday: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month, day).getDay() === weekday) count++;
    }
    return count;
  }

  return (
    <div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {isUsersLoading || isAttendanceLoading || isNoClassesLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : isUsersError || isAttendanceError || isNoClassesError ? (
        <div className="error-container">
          <p>{usersError?.message || attendanceError?.message || noClassesError?.message}</p>
          <button className="retry-button" onClick={() => {refetchUsers(); refetchAttendance(); refetchNoClasses();}} disabled={isUsersRefetching || isAttendanceRefetching || isNoClassesRefetching}>{(isUsersRefetching || isAttendanceRefetching || isNoClassesRefetching) ? 'Laddar...' : 'Försök igen'}</button>
        </div>
      ) : (
      <div className="page-main">
            <div className="page-header-row-direction">
              {showStats && (
                <>                
                  <h1>Statistik</h1>
                  <button className="standard-btn stat-btn" onClick={() => setShowStats(false)}>Visa närvaro</button>
                </>
              )}
              {!showStats && (
                <>
                <button className="standard-btn" onClick={() => changeWeek(false)}>&lt;</button>
                <div className="flex-column-center">
                  <h2>Närvarosida</h2>
                  <p className="week-select">{week}</p>
                </div>
                <button className="standard-btn" onClick={() => changeWeek(true)}>&gt;</button>
                <button className="standard-btn stat-btn" onClick={() => setShowStats(true)}>Statistik</button>
                </>
              )}
          </div>
        <div className="page-content">
            <div className="page-table-wrapper">
                {!showStats && (<table className="page-table">
                    <thead>
                      <tr>
                          <th>Namn</th>
                          <th><button className={"absent-btn add-margin-bottom" + styleNoclassButtons(getDate(1))} onClick={() => updateNoClassesMutation.mutate(getDate(1))}></button><div className="flex-horizontal-center"><span>Mån</span> {dateFormatted(getDate(1))} <span>Närvaro: {countAttendance(getDate(1))}</span></div></th>
                          <th><button className={"absent-btn add-margin-bottom" + styleNoclassButtons(getDate(2))} onClick={() => updateNoClassesMutation.mutate(getDate(2))}></button><div className="flex-horizontal-center"><span>Tis</span> {dateFormatted(getDate(2))} <span>Närvaro: {countAttendance(getDate(2))}</span></div></th>
                          <th><button className={"absent-btn add-margin-bottom" + styleNoclassButtons(getDate(3))} onClick={() => updateNoClassesMutation.mutate(getDate(3))}></button><div className="flex-horizontal-center"><span>Ons</span> {dateFormatted(getDate(3))} <span>Närvaro: {countAttendance(getDate(3))}</span></div></th>
                          <th><button className={"absent-btn add-margin-bottom" + styleNoclassButtons(getDate(4))} onClick={() => updateNoClassesMutation.mutate(getDate(4))}></button><div className="flex-horizontal-center"><span>Tor</span> {dateFormatted(getDate(4))} <span>Närvaro: {countAttendance(getDate(4))}</span></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.filter(x=> x.authLevel === 4 && x.isActive && x.startDate && new Date(x.startDate) <= getDate(4)).sort((a, b) => {
                        const fourWeeksAgo = new Date();
                        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                        const countAttendance = (userId: number) => {
                          const userAttendance = attendance.find(att => att.userId === userId);
                          if (!userAttendance) return 0;
                          return userAttendance.date.filter(d => new Date(d) >= fourWeeksAgo).length;
                        };
                        const diff = countAttendance(b.id) - countAttendance(a.id);
                        return diff !== 0 ? diff : a.firstName.localeCompare(b.firstName);
                      }).map((item, i) => (
                        <tr key={i}>
                          <td>{item.firstName} {item.lastName}</td>
                          {Array.from({ length: 4 }).map((_ : any, index: any) =>
                            { return (
                            <td key={index}>
                              {item.startDate !== null && new Date(item.startDate) <= getDate(index + 2) && <button onClick={() => { if (noClasses.filter(d => compareDates(new Date(d), getDate(index +1))).length === 0) updateAttendanceMutation.mutate({ userId: item.id, date: getDate(index +1).toISOString() } as UpdateAttendanceDto)}} className={'absent-btn' + styleAttendanceButtons(item, getDate(index +1))} ></button>}
                              {/* <button key={index} onClick={() => updateAttendanceMutation.mutate({ userId: item.id, date: getDate(index +1).toISOString() } as UpdateAttendanceDto)} className={'absent' + (hasAttended(item, getDate(index +1)) ? " attended" : "")} ></button> */}
                            </td> );
                            })
                          }
                        </tr>
                      ))}
                    </tbody>
                </table>)}
                {showStats && (
                  <table className="page-table">
                    <thead>
                      <tr>
                          <th>Veckodagar/Månader</th>
                          <th><span>{getMonthName(0)}</span></th>
                          <th><span>{getMonthName(-1)}</span></th>
                          <th><span>{getMonthName(-2)}</span></th>
                          <th><span>{getMonthName(-3)}</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Måndag</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 1 && attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0)})).length / numberOfWeekdaysInMonth(1, getFirstDayOfMonth(0).getMonth(), getFirstDayOfMonth(0).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 1 && attDate >= getFirstDayOfMonth(-1) && attDate <= getLastDayOfMonth(-1)})).length / numberOfWeekdaysInMonth(1, getFirstDayOfMonth(-1).getMonth(), getFirstDayOfMonth(-1).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 1 && attDate >= getFirstDayOfMonth(-2) && attDate <= getLastDayOfMonth(-2)})).length / numberOfWeekdaysInMonth(1, getFirstDayOfMonth(-2).getMonth(), getFirstDayOfMonth(-2).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 1 && attDate >= getFirstDayOfMonth(-3) && attDate <= getLastDayOfMonth(-3)})).length / numberOfWeekdaysInMonth(1, getFirstDayOfMonth(-3).getMonth(), getFirstDayOfMonth(-3).getFullYear()))}</td>
                      </tr>
                      <tr>
                        <td>Tisdag</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 2 && attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0)})).length / numberOfWeekdaysInMonth(2, getFirstDayOfMonth(0).getMonth(), getFirstDayOfMonth(0).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 2 && attDate >= getFirstDayOfMonth(-1) && attDate <= getLastDayOfMonth(-1)})).length / numberOfWeekdaysInMonth(2, getFirstDayOfMonth(-1).getMonth(), getFirstDayOfMonth(-1).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 2 && attDate >= getFirstDayOfMonth(-2) && attDate <= getLastDayOfMonth(-2)})).length / numberOfWeekdaysInMonth(2, getFirstDayOfMonth(-2).getMonth(), getFirstDayOfMonth(-2).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 2 && attDate >= getFirstDayOfMonth(-3) && attDate <= getLastDayOfMonth(-3)})).length / numberOfWeekdaysInMonth(2, getFirstDayOfMonth(-3).getMonth(), getFirstDayOfMonth(-3).getFullYear()))}</td>
                      </tr>
                      <tr>
                        <td>Onsdag</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 3 && attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0)})).length / numberOfWeekdaysInMonth(3, getFirstDayOfMonth(0).getMonth(), getFirstDayOfMonth(0).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 3 && attDate >= getFirstDayOfMonth(-1) && attDate <= getLastDayOfMonth(-1)})).length / numberOfWeekdaysInMonth(3, getFirstDayOfMonth(-1).getMonth(), getFirstDayOfMonth(-1).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 3 && attDate >= getFirstDayOfMonth(-2) && attDate <= getLastDayOfMonth(-2)})).length / numberOfWeekdaysInMonth(3, getFirstDayOfMonth(-2).getMonth(), getFirstDayOfMonth(-2).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 3 && attDate >= getFirstDayOfMonth(-3) && attDate <= getLastDayOfMonth(-3)})).length / numberOfWeekdaysInMonth(3, getFirstDayOfMonth(-3).getMonth(), getFirstDayOfMonth(-3).getFullYear()))}</td>
                      </tr>
                      <tr>
                        <td>Torsdag</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 4 && attDate >= getFirstDayOfMonth(0) && attDate <= getLastDayOfMonth(0)})).length / numberOfWeekdaysInMonth(4, getFirstDayOfMonth(0).getMonth(), getFirstDayOfMonth(0).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 4 && attDate >= getFirstDayOfMonth(-1) && attDate <= getLastDayOfMonth(-1)})).length / numberOfWeekdaysInMonth(4, getFirstDayOfMonth(-1).getMonth(), getFirstDayOfMonth(-1).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 4 && attDate >= getFirstDayOfMonth(-2) && attDate <= getLastDayOfMonth(-2)})).length / numberOfWeekdaysInMonth(4, getFirstDayOfMonth(-2).getMonth(), getFirstDayOfMonth(-2).getFullYear()))}</td>
                        <td>{Math.round(attendance.filter(att => att.date.some(d => { const attDate = new Date(d); return attDate.getDay() === 4 && attDate >= getFirstDayOfMonth(-3) && attDate <= getLastDayOfMonth(-3)})).length / numberOfWeekdaysInMonth(4, getFirstDayOfMonth(-3).getMonth(), getFirstDayOfMonth(-3).getFullYear()))}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
            </div>
          </div>
      </div>)}
    </div>
  );
}

  export default Attendance;