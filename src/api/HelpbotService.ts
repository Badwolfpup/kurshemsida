type ChatMessage = { role: string; content: string };

export const helpbotService = {
    chat: async (message: string, history: ChatMessage[]): Promise<{ reply: string }> => {
        const response = await fetch('/api/helpbot/chat', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: history.slice(-6) }),
        });
        if (response.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized. Redirecting to login.');
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
};
