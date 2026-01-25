import React from "react";
import { useState } from "react";
import type UserType from "../../Types/User";
import type AttendanceType  from "../../Types/Attendance";
import type {  UpdateAttendanceDto } from "../../Types/Dto/AttendanceDto";
import { useUsers } from "../../hooks/useUsers";
import { useAttendance, useUpdateAttendance, useGetWeek } from "../../hooks/useAttendance";
import './Attendance.css';
import '../../styles/spinner.css'


const Attendance: React.FC = () => {

  const [date, setDate] = useState<Date>(new Date());
  const { data: users = [] as UserType[], isLoading: isUsersLoading, isError: isUsersError, error: usersError, refetch: refetchUsers, isRefetching: isUsersRefetching } = useUsers();
  const { data: attendance = [] as AttendanceType[], isLoading: isAttendanceLoading, isError: isAttendanceError, error: attendanceError, refetch: refetchAttendance, isRefetching: isAttendanceRefetching } = useAttendance(date, 1);
  const { data: week } = useGetWeek(date, 1);
  const updateAttendance = useUpdateAttendance();


  const changeWeek = (change: boolean) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + (change ? 7 : -7));
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

  const hasAttended = (user: UserType, date: Date): boolean => {
    const result = attendance.filter(x => x.userId === user.id).filter(dates => dates.date.some(d => compareDates(new Date(d), date))
    ).length > 0;
    return result;
  };

  return (
    <div>
      {isUsersLoading || isAttendanceLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : isUsersError || isAttendanceError ? (
        <div className="error-container">
          <p>{usersError?.message || attendanceError?.message}</p>
          <button className="retry-button" onClick={() => {refetchUsers(); refetchAttendance();}} disabled={isUsersRefetching || isAttendanceRefetching}>{(isUsersRefetching || isAttendanceRefetching) ? 'Laddar...' : 'Försök igen'}</button>
        </div>
      ) : (
      <div className="attendence-container">
          <h1>Närvarosida</h1>
            <div className="week-picker">
                <button className="prev-week-button" onClick={() => changeWeek(false)}>&lt;</button>
                <p className="week-select">{week}</p>
                <button className="next-week-button" onClick={() => changeWeek(true)}>&gt;</button>
            </div>
            <div className="attendence-table">
                <table>
                    <thead>
                      <tr>
                          <th>Namn</th>
                          <th>Måndag</th>
                          <th>Tisdag</th>
                          <th>Onsdag</th>
                          <th>Torsdag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.filter(x=> x.authLevel === 4).map((item, i) => (
                        <tr key={i}>
                          <td>{item.firstName} {item.lastName}</td>
                          {Array.from({ length: 4 }).map((_ : any, index: any) =>
                            { return (
                            <td>
                              <button key={index} onClick={() => updateAttendance.mutate({ userId: item.id, date: getDate(index +1).toISOString() } as UpdateAttendanceDto)} className={'absent' + (hasAttended(item, getDate(index +1)) ? " attended" : "")} ></button>
                            </td> );
                            })
                          }
                        </tr>
                      ))}
                    </tbody>
                </table>
            </div>
      </div>)}
    </div>
  );
}

  export default Attendance;