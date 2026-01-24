import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../api/AttendanceService';
import type { UpdateAttendanceDto } from '../Types/Dto/AttendanceDto';

export function useAttendance(date: Date) {
    return useQuery({
        queryKey: ['attendance', date],
        queryFn: () => attendanceService.fetchAttendance(date),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useUpdateAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (attendance: UpdateAttendanceDto) => attendanceService.updateAttendance(attendance),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        }
    });
}


export function useGetWeek(date: Date) {
    return useQuery({
        queryKey: ['week', date],
        queryFn: () => attendanceService.getWeek(date),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}