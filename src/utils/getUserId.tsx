function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

const getUserId = (token: string | null): string => {
  if (!token) {
    console.log('No token, returning empty string');
    return '';
  }
  try {
    const decoded = decodeJWT(token);
    const id = decoded?.sub || '';
    return id;
  } catch (error) {
    console.log('Error decoding token:', error);
    return '';
  }
};

export default getUserId;