export interface AddProjectDto {
  title: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  difficulty: number;
  projectType: string;
}

export interface UpdateProjectDto {
    id: number;
    title?: string;
    description?: string;
    html?: string;
    css?: string;
    javascript?: string;
    difficulty?: number;
    projectType?: string;
}

