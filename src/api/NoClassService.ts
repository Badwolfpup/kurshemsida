
export const noClassService = {
    async fetchNoClasses(): Promise<Date[]> {
        const response = await fetch('api/noclass', {
        credentials: 'include',
    });
        responseAction(response);
        const data = await response.json();
        return data.map((x: { id:number, date:string}) => new Date(x.date));
    },
    async updateNoClasses(dateString: string): Promise<boolean> {
        const response = await fetch(`/api/noclass/${dateString}`, {
            credentials: 'include',
            method: 'POST',
        });
        responseAction(response);
        return true;
    }
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