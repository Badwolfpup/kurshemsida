export interface AddPostDto {
    userId: number;
    html: string;
    delta: string;
    publishDate: string;
}


export interface UpdatePostDto {
    id: number;
    html?: string;
    delta?: string;
    publishDate?: string;
}