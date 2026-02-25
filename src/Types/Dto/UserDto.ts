export interface AddUserDto {
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  startDate?: Date | null;
  authLevel: number; 
  course?: number;
  coachId?: number;
  contactId?: number;
}

export interface DeleteUserDto {
  id: number;
}

export interface UpdateUserDto {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string | null;
  authLevel?: number; 
  startDate?: Date | null;
  isActive?: boolean ;
  course?: number | null;  
  coachId?: number | null;  
  contactId?: number | null; 
  scheduledMonAm?: boolean;
  scheduledMonPm?: boolean;
  scheduledTueAm?: boolean;
  scheduledTuePm?: boolean;
  scheduledWedAm?: boolean;
  scheduledWedPm?: boolean;
  scheduledThuAm?: boolean;
  scheduledThuPm?: boolean;
  emailNotifications?: boolean;
}