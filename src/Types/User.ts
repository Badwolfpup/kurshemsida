export default interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authLevel: number; 
  isActive: boolean;
  course: number | null;
  coachId: number | null;
  contactId: number | null;
  scheduledMonAm: boolean;
  scheduledMonPm: boolean;
  scheduledTueAm: boolean;
  scheduledTuePm: boolean;
  scheduledWedAm: boolean;
  scheduledWedPm: boolean;
  scheduledThuAm: boolean;
  scheduledThuPm: boolean;
}