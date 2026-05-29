export interface Computer {
  id: number;
  number: number;
  isActive: boolean;
  ownerStudentId: number | null;
  takesHome: boolean;
}

export interface ComputerAssignment {
  id: number;
  computerId: number;
  dayOfWeek: number;
  period: string;
  studentId: number;
}
