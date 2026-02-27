import type PostType from "../Types/PostType";
import type { AddPostDto, UpdatePostDto } from "../Types/Dto/PostDto";

export function sortPostsByDate(posts: PostType[]): PostType[] {
    return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export const postService = {
    fetchPosts: async (): Promise<PostType[]> => {
        const response = await fetch('/api/fetch-posts', {
            credentials: 'include',
        });
        responseAction(response);
        const posts: PostType[] = await response.json();
        return sortPostsByDate(posts);
    } ,
    addPost: async (post: AddPostDto): Promise<boolean> => { 
        const response = await fetch('/api/add-posts', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        });

        responseAction(response);
        sessionStorage.removeItem('draftPost');
        return true;
    },
    updatePost: async (post: UpdatePostDto): Promise<boolean> => {
        const response = await fetch('/api/update-posts', {
            method: 'PUT',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(post)
        });
        responseAction(response);
        return true;
    },
    deletePost: async (id: number): Promise<boolean> => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort inlägget? Detta kan inte ångras.`);
        if (!prompt) return false;
        const response = await fetch(`/api/delete-post/${id}`, {
            credentials: 'include',
            method: 'DELETE'
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