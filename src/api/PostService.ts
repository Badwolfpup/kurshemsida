import type PostType from "../Types/PostType";
import type { AddPostDto, UpdatePostDto } from "../Types/Dto/PostDto";

export const postService = {
    fetchPosts: async (): Promise<PostType[]> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/fetch-posts', {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts: PostType[] = await response.json();
        posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        return posts;
    } ,
    addPost: async (post: AddPostDto): Promise<boolean> => { 

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');
       
        const response = await fetch('/api/add-posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(post),
        });

        if (!response.ok) throw new Error(`Failed to publish post: ${response.statusText}`);
        sessionStorage.removeItem('draftPost');
        return true;
    },
    updatePost: async (post: UpdatePostDto): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/update-posts', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(post)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    },
    deletePost: async (id: number): Promise<boolean> => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort inlägget? Detta kan inte ångras.`);
        if (!prompt) return false;
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/delete-post/${id}`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            },
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
        }
}