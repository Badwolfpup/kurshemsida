import React from "react";
import { useState } from "react";
import type UserType from "../../Types/User";
import type AttendanceType  from "../../Types/Attendance";
import type {  UpdateAttendanceDto } from "../../Types/Dto/AttendanceDto";
import { useUsers } from "../../hooks/useUsers";
import { useNoClasses, useUpdateNoClasses } from "../../hooks/useNoClass";
import { useAttendance, useUpdateAttendance, useGetWeek } from "../../hooks/useAttendance";
import Toast from '../../utils/toastMessage';
import './Attendance.css';
import '../../styles/spinner.css'


const Attendance: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
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
    if (isNoClass) return " noclass";
    const result = attendance.filter(x => x.userId === user.id).filter(dates => dates.date.some(d => compareDates(new Date(d), date))
    ).length > 0;
    return result ? " attended" : "";
  };

  const styleNoclassButtons = (date: Date): string => {
    const isNoClass = noClasses.filter(d => compareDates(new Date(d), date)).length > 0;
    return isNoClass ? " noclass" : "";
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
                          <th><button className={"absent" + styleNoclassButtons(getDate(1))} onClick={() => updateNoClassesMutation.mutate(getDate(1))}></button><div className="date-header-admin-attendance"><span>Mån</span> {dateFormatted(getDate(1))}</div></th>
                          <th><button className={"absent" + styleNoclassButtons(getDate(2))} onClick={() => updateNoClassesMutation.mutate(getDate(2))}></button><div className="date-header-admin-attendance"><span>Tis</span> {dateFormatted(getDate(2))}</div></th>
                          <th><button className={"absent" + styleNoclassButtons(getDate(3))} onClick={() => updateNoClassesMutation.mutate(getDate(3))}></button><div className="date-header-admin-attendance"><span>Ons</span> {dateFormatted(getDate(3))}</div></th>
                          <th><button className={"absent" + styleNoclassButtons(getDate(4))} onClick={() => updateNoClassesMutation.mutate(getDate(4))}></button><div className="date-header-admin-attendance"><span>Tor</span> {dateFormatted(getDate(4))}</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.filter(x=> x.authLevel === 4).map((item, i) => (
                        <tr key={i}>
                          <td>{item.firstName} {item.lastName}</td>
                          {Array.from({ length: 4 }).map((_ : any, index: any) =>
                            { return (
                            <td key={index}>
                              <button onClick={() => { if (noClasses.filter(d => compareDates(new Date(d), getDate(index +1))).length === 0) updateAttendanceMutation.mutate({ userId: item.id, date: getDate(index +1).toISOString() } as UpdateAttendanceDto)}} className={'absent' + styleAttendanceButtons(item, getDate(index +1))} ></button>
                              {/* <button key={index} onClick={() => updateAttendanceMutation.mutate({ userId: item.id, date: getDate(index +1).toISOString() } as UpdateAttendanceDto)} className={'absent' + (hasAttended(item, getDate(index +1)) ? " attended" : "")} ></button> */}
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