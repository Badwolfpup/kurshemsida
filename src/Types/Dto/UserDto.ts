export interface AddUserDto {
  firstName: string;
  lastName: string;
  email: string;
  authLevel: number; 
  course?: number;
  coachId?: number;
  contactId?: number;
}

export interface DeleteUserDto {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  authLevel?: number; 
  isActive?: boolean ;
  course?: number;
  coachId?: number;
  contactId?: number;
}