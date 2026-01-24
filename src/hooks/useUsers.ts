import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/UserService';
import type { AddUserDto, DeleteUserDto, UpdateUserDto } from '../Types/Dto/UserDto';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: userService.fetchUsers,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAddUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: AddUserDto) => userService.addUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: UpdateUserDto) => userService.updateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: DeleteUserDto) => userService.deleteUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}