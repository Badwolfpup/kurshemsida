 interface Permissions {
  userId: number;
  html: boolean;
  css: boolean;
  javascript: boolean;
  variable: boolean;
  conditionals: boolean;
  loops: boolean;
  functions: boolean;
  arrays: boolean;
  objects: boolean;
}
 
 export const getPermissions = async (email: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found.');
      return;
    }
    try {
      const response = await fetch(`/api/fetch-user-permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Email: email })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Permissions = await response.json();
      return data;
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'An error occurred');
    }
  }

   export default getPermissions;