export default interface ProjectType {
  id: number;
  title: string;
  description: string;
  html: string;
  css: string;
  javascript: string;
  difficulty: number;
  tags: string[];
  lightbulbs: boolean[];
}