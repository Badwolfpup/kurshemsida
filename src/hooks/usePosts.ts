import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../api/PostService';
import type { AddPostDto, UpdatePostDto } from '../Types/Dto/PostDto';

export function usePosts() {
    return useQuery({
        queryKey: ['posts'],
        queryFn: postService.fetchPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAddPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: AddPostDto) => postService.addPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();   
    return useMutation({
        mutationFn: (post: UpdatePostDto) => postService.updatePost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    }); 
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => postService.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}