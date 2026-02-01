import type { UpdateAttendanceDto } from "../Types/Dto/AttendanceDto";
import type AttendanceType from "../Types/Attendance";

export const attendanceService = {
    
    fetchAttendance: async (date: Date, count: number): Promise<AttendanceType[]> => {
        const response = await fetch(`/api/weekly-attendance/${date.toISOString()}/${count}`, {
            credentials: 'include',
        });
        responseAction(response);
        return await response.json();
    },
    updateAttendance: async (attendance: UpdateAttendanceDto): Promise<boolean> => {
        const response = await fetch(`/api/update-attendance`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance),
        });
        responseAction(response);
        return true;
    },
    getWeek: async (date: Date, count: number): Promise<string> => {
        
        const response = await fetch(`/api/get-week/${date.toISOString()}/${count}`, {
            credentials: 'include',
        });
        responseAction(response);
        return (await response.text()).replaceAll('"', '');
    }
}

const responseAction = (response: Response): void => {
    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized. Redirecting to login.');
    }
    else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}