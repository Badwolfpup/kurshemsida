export default interface ExerciseType {
  id: number;
  title: string;
  description: string;
  javascript: string;
  expectedResult: string;
  difficulty: number;
  clues: string[];
  exerciseType: string;
  lightbulbs: boolean[];
  goodToKnow: string;
}