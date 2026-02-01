import type UserType from "../Types/User";
import type { AddUserDto, UpdateUserDto, DeleteUserDto } from "../Types/Dto/UserDto";

export const userService = {
    fetchUsers: async (): Promise<UserType[]> => {

        const response = await fetch(`/api/fetch-users`, {
            credentials: 'include',
        });
        responseAction(response);
        const data = await response.json() as UserType[];
        data.sort((a, b) => a.firstName.localeCompare(b.firstName));
        return data;
    },
    addUser: async (user: AddUserDto): Promise<boolean> => {
        const response = await fetch('/api/add-user', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        responseAction(response);
        return true;
    },
    updateUser: async (user: UpdateUserDto) => {
      const response = await fetch(`/api/update-user`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      responseAction(response);
      return true;    
    },
    deleteUser: async (user: DeleteUserDto) => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort användaren ${user.firstName} ${user.lastName}? Detta kan inte ångras.`);
        if (!prompt) return;
        const response = await fetch('/api/delete-user', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        responseAction(response);
        return true;
    },
    updateActivity: async (userId: number): Promise<boolean> => {
        const response = await fetch(`/api/update-activity`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) {
            throw new Error(`Failed to update user activity status: ${response.status}`);
        }
        return true;    
    }, 

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