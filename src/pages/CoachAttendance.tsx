import React from "react";
import getUsers from "../data/FetchUsers";
import { useState, useEffect } from "react";
import './CoachAttendance.css'
import { useUser } from "../context/UserContext";

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

const CoachAttendance: React.FC = () => {

    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [usersForDropdown, setUsersForDropdown] = useState<User[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());
    const {userId } = useUser();
    const [loading, setLoading] = useState(true);
    const [userFetched, setUserFetched] = useState(false);
    

    useEffect(() => {
    fetchUsers();  
    }, [date]);

    useEffect(() => {
    if (activeUsers.length > 0) {  
        getWeek();
        getAttendance();
    }
    }, [date, userFetched]); 

  
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await getUsers() as User[];
        setFilteredUsers(users.filter(user => user.isActive && user.authLevel === 4 && user.coachId === userId));
        setActiveUsers(users.filter(user => user.isActive && user.authLevel === 4 && user.coachId === userId));
        setUsersForDropdown(users.filter(user => user.isActive && user.authLevel === 4 && user.coachId === userId));
        setLoading(false);
        setUserFetched(true);
      } catch (err) {
        setLoading(false);
      }
    }


    const getWeek = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No authentication token found. Please log in.');
        return;
    }
    try {
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
    } catch (err) {
        console.log(err instanceof Error ? err.message : 'An error occurred');
    }
    }

    const getAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No authentication token found. Please log in.');
        return;
    }
    try {
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
        let data = await response.json();
        setActiveUsers(prevUsers => 
          prevUsers.map(user => {
          const attendanceData = data.find((item: any) => item.id === user.id);
          return attendanceData ? { ...user, attendedDays: attendanceData.attendedDays } : user;
        }));
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => {
          const attendanceData = data.find((item: any) => item.id === user.id);
          return attendanceData ? { ...user, attendedDays: attendanceData.attendedDays } : user;
        })
      );
        
      } catch (err) {
          console.log(err instanceof Error ? err.message : 'An error occurred');
      }
    }

    const changeWeek = (change: boolean) => setDate(new Date(date.setDate(date.getDate() + (change ? 7 : -7))));


    const getDate = (offset: number): Date => {
      const today = new Date();
      const monday = new Date(today);
      const dayOfWeek = today.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;  // Treat Sunday as 7
      monday.setDate(today.getDate() - adjustedDay + offset);
      return monday;
    };


    const compareDates = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    const showUser = (id: number) => {
        console.log(id);
        if (id !== 0) setFilteredUsers(activeUsers.filter(user => user.id === id));
        else setFilteredUsers(activeUsers);
    }

const hasAttended = (user: User, date: Date): boolean => {
  if (!user?.attendedDays || !Array.isArray(user.attendedDays)) return false;
  const result = user.attendedDays.some(d => compareDates(new Date(d), date));
  return result;
};

  return (
    <div>
      {loading ? (
        <div>Loading users...</div>  // Or a spinner component
      ) : (
      <div className="attendence-container">
          <div className='navbar'>
              <select id="user-dropdown" onChange={(e) => showUser(Number(e.target.value))}>
                  <option value="0">Alla deltagare</option>
                  {usersForDropdown.map(user => (
                  <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                  </option>
                  ))}
              </select>
          </div>
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
                    {filteredUsers.map(item => (
                      <tr key={item.id}>
                        <td>{item.firstName[0].toUpperCase()}.{item.lastName[0].toUpperCase()}</td>
                        {Array.from({ length: 4 }).map((_ : any, index: any) => 
                          { return (
                          <td> 
                            <button key={index} className={'absent' + (hasAttended(item, getDate(index +1)) ? " attended" : "")} ></button>
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

  export default CoachAttendance;