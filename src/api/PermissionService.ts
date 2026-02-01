// const responseAction = (response: Response): void => {
//     if (response.status === 401) {
//         window.location.href = '/login';
//         throw new Error('Unauthorized. Redirecting to login.');
//     }
//     else if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }
// }