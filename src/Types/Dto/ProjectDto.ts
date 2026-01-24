export interface AddProjectDto {
  title: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  difficulty: number;
  tags: string[];
}

export interface UpdateProjectDto {
    id: number;
    title?: string;
    description?: string;
    html?: string;
    css?: string;
    javascript?: string;
    difficulty?: number;
    tags?: string[];
}

