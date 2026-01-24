import type UserType from "../Types/User";
import type { AddUserDto, UpdateUserDto, DeleteUserDto } from "../Types/Dto/UserDto";

export const userService = {
    fetchUsers: async (): Promise<UserType[]> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }

        const response = await fetch(`/api/fetch-users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as UserType[];
        data.sort((a, b) => a.firstName.localeCompare(b.firstName));
        return data;
    },
    addUser: async (user: AddUserDto): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }

        const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
        });

        if (!response.ok) {
        throw new Error(`Failed to add user: ${response.status}`);
        }
        return true;
    },
    updateUser: async (user: UpdateUserDto) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }
      const response = await fetch(`/api/update-user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        throw new Error(`Failed to ${(user.isActive ? "inactivate" : "activate")} user: ${response.status}`);
      }
      return true;    },
    deleteUser: async (user: DeleteUserDto) => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort användaren ${user.firstName} ${user.lastName}? Detta kan inte ångras.`);
        if (!prompt) return;
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }
        const response = await fetch('/api/delete-user', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
        }
        return true;
    }   

}