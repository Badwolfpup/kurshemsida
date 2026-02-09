export interface PortfolioOwner {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  aboutMe: string;
  profileImageUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  hideFirstName: boolean;
  hideLastName: boolean;
  hideEmail: boolean;
  hideTelephone: boolean;
}

export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  githubLink: string;
  isPrivate: boolean;
}
