import React from "react";
import { useFetchActiveUsers } from "../../hooks/useFetchActiveUsers";
import { useState, useEffect } from "react";
import './Attendance.css'

interface AttendanceRecord {
  id: number;
  name: string;
  attended: Record<string, boolean>;
}

const Attendance: React.FC = () => {

  const [error, setError] = useState<string | null>(null);
  const activeUsers = useFetchActiveUsers(setError); 
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  useEffect(() => {
    getWeek();
    getAttendance();
  }, [date]);

  // useEffect(() => {
  //   getAttendance();
  // }, [date]);
  
  const getWeek = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch('https://localhost:5001/api/get-week', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: date.toISOString(),
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSelectedWeek((await response.text()).replaceAll('"', ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const getAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch('https://localhost:5001/api/get-weekly-attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ChosenDate: date.toISOString() }),
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Data:", data);
      setAttendanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const changeWeek = (change: boolean) => setDate(new Date(date.setDate(date.getDate() + (change ? 7 : -7))));

  const hasAttendance = (userId : number) => attendanceData.find(record => record.id === userId) !== undefined;

  const getMondayDate = (offset: number) : Date => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + offset);
    return monday;
  }

  const changeAttendance = async (userId: number, date: string, attended: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch('https://localhost:5001/api/update-attendance', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UserId: userId, Date: date, Attended: attended })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await getAttendance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <div className="attendence-container">
        <h1>Närvarosida</h1>
        <div className="week-picker">
            <button className="prev-week-button" onClick={() => changeWeek(false)}>&lt;</button>
            <p className="week-select">{selectedWeek}</p>
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
                  {activeUsers.map(item => (
                    <tr key={item.id}>
                      <td>{item.firstName} {item.lastName}</td>
                      {hasAttendance(item.id) ? Object.entries(attendanceData.find(record => record.id === item.id)?.attended || {}).map(([date, attended]) => (
                        <td> 
                          <button key={date} onClick={() => changeAttendance(item.id, date, attended)} className={attended ? 'attended' : 'absent'}></button>
                        </td>
                      )) : 
                      Array.from({ length: 4 }).map((_ : any, index: any) => (
                        <td>
                          <button key={getMondayDate(index + 1).toISOString()} onClick={() => changeAttendance(item.id, getMondayDate(index + 1).toISOString(), false)} className="absent"></button>
                        </td>
                      ))}
          
                    </tr>
                  ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

  export default Attendance;