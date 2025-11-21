import { useState, useEffect } from 'react';


export const useFetchUserPermissions = (
  selectedEmail: string,
  triggerFetch: boolean = true,
  setError?: (error: string | null) => void,
) => {
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!triggerFetch) {
      // console.log('triggerFetch is false, setting loading false');
      setLoading(false);
      return;
    }
    if (!selectedEmail) {
      console.log('No selectedEmail, setting loading false');
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      if (setError)setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        if (setError) setError('No authentication token found.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://localhost:5001/api/fetch-user-permissions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Email: selectedEmail })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: any[] = await response.json();
        setUserPermissions(data.length > 0 ? data[0] : {});
      } catch (err) {
        console.log('Error fetching permissions:', err);
        if (setError)setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [selectedEmail, setError, triggerFetch]);

  return { userPermissions, loading };
};