import React, { useMemo } from "react";
import getUsers from "../../data/FetchUsers";
import { useState, useEffect } from "react";
import './Attendance.css';
import '../../styles/spinner.css'

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authLevel: number;  // Role as number
  isActive: boolean;
  course: number;
  coachId?: number | null;
  attendedDays: Date[];
}

const Attendance: React.FC = () => {


  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<User[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [userFetched, setUserFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

const usersWithAttendance  = useMemo(() => 
  activeUsers.map(user => {
    const a = attendance.find(x => x.id === user.id);
    return a ? { ...user, attendedDays: a.attendedDays } : user;
  }), [activeUsers, attendance]);

useEffect(() => {
  fetchUsers();  // Fetches and sets activeUsers
}, [date]);

useEffect(() => {
  const loadAttendanceData = async () => {
    if (activeUsers.length > 0) {
      const spinnerTimeout = setTimeout(() => {
        setLoading(true);
      }, 300);

      setError(null);
      try {
        await Promise.all([getWeek(), getAttendance()]);
      } catch (err) {
        setError('Kunde inte ladda närvarodata. Försök igen senare.');
      } finally {
        clearTimeout(spinnerTimeout);
        // Always set loading to false when done, regardless of whether timeout fired
        setLoading(false);
      }
    }
  };
  loadAttendanceData();
}, [userFetched, date]);

  
  const fetchUsers = async () => {
    setError(null);
    try {
      const users = await getUsers() as User[];
      setActiveUsers(users.filter(user => user.isActive && user.authLevel === 4));
      setUserFetched(true);
    } catch (err) {
      setError('Kunde inte ladda användare. Försök igen senare.');
    } finally {
    }
  }


  const getWeek = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Ingen autentiseringstoken hittades.');
    }
    const response = await fetch(`/api/get-week/${date.toISOString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain'
      },
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    setSelectedWeek((await response.text()).replaceAll('"', ''));
  }

  const getAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Ingen autentiseringstoken hittades.');
    }
    const response = await fetch(`/api/weekly-attendance/${date.toISOString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    setAttendance(await response.json());
  }

  const changeWeek = (change: boolean) => setDate(new Date(date.setDate(date.getDate() + (change ? 7 : -7))));

const getDate = (offset: number): Date => {
  const today = new Date();
  const monday = new Date(date);
  const dayOfWeek = today.getDay();
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;  // Treat Sunday as 7
  monday.setDate(monday.getDate() - adjustedDay + offset);
  return monday;
};

  const changeAttendance = async (e: React.MouseEvent<HTMLButtonElement>, userId: number, date: Date) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`/api/update-attendance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UserId: userId, Date: date.toISOString() }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      var button = e.target as HTMLButtonElement;
      button.classList.toggle('attended');
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const compareDates = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  const hasAttended = (user: User, date: Date): boolean => {
    if (!user?.attendedDays || !Array.isArray(user.attendedDays)) return false;
    const result = user.attendedDays.some(d => compareDates(new Date(d), date));
    return result;
  };

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Laddar användare...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchUsers}>Försök igen</button>
        </div>
      ) : (
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
                      {usersWithAttendance.map((item, i) => (
                        <tr key={i}>
                          <td>{item.firstName} {item.lastName}</td>
                          {Array.from({ length: 4 }).map((_ : any, index: any) =>
                            { return (
                            <td>
                              <button key={index} onClick={(e) => changeAttendance(e, item.id, getDate(index +1))} className={'absent' + (hasAttended(item, getDate(index +1)) ? " attended" : "")} ></button>
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