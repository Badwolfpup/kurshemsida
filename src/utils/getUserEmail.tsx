function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

const getUserEmail = (token: string | null): string => {
  if (!token) {
    console.log('No token, returning empty string');
    return '';
  }
  const decoded = decodeJWT(token);
  const email = decoded?.sub || '';
  return email;
};

export default getUserEmail;