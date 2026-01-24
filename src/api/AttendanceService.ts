import type { UpdateAttendanceDto } from "../Types/Dto/AttendanceDto";
import type AttendanceType from "../Types/Attendance";

export const attendanceService = {
    fetchAttendance: async (date: Date): Promise<AttendanceType[]> => {
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
        return await response.json();
    },
    updateAttendance: async (attendance: UpdateAttendanceDto): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/update-attendance`, {
            method: 'PUT',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    },
    getWeek: async (date: Date): Promise<string> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Ingen autentiseringstoken hittades.');
        
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
        return (await response.text()).replaceAll('"', '');
    }
}