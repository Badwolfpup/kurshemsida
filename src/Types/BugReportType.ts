export interface BugReportType {
  id: number;
  type: string;
  content: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

export interface AddBugReportDto {
  type: string;
  content: string;
}
