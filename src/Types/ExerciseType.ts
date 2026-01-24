export default interface ExerciseType {
  id: number;
  title: string;
  description: string;
  javascript: string;
  expectedResult: string;
  difficulty: number;
  tags: string[];
  clues: string[];
  lightbulbs: boolean[];
}