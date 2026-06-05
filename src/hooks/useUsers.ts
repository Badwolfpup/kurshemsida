import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/UserService';
import type { AddUserDto, DeleteUserDto, UpdateUserDto } from '../Types/Dto/UserDto';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => userService.fetchUsers(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAddUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: AddUserDto) => userService.addUser(user),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * SCENARIO: Admin/teacher edits a participant (incl. status: på plats / distans / paus) and saves
 * CALLS: PUT /api/update-user (UserEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates the provided fields on the target user in the database (backend)
 *   - Persists participant Status, which drives reduced-attendance UI everywhere it is read
 *   - Invalidates ["users"] cache so the list, detail, Närvaro, Klassrum, and coach views refresh
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UpdateUserDto) => userService.updateUser(user),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateMySettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: { emailNotifications?: boolean; telephone?: string }) =>
            userService.updateMySettings(dto),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateActivityStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => userService.updateActivity(userId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}



/**
 * SCENARIO: Student saves their own email and phone number from the profile/settings page
 * CALLS: PUT /api/update-student-profile (UserEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates the student's Email and Telephone in the database (backend)
 *   - Invalidates ["users"] cache so the UI reflects the new values
 *   - Returns 409 if email or phone is already taken by another user
 */
export function useUpdateStudentProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { email: string; telephone: string }) =>
            userService.updateStudentProfile(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * SCENARIO: Admin permanently deletes an inactive user
 * CALLS: DELETE /api/delete-user (UserEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes user from database (backend)
 *   - Invalidates ["users"] cache
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: DeleteUserDto) => userService.deleteUser(user),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}