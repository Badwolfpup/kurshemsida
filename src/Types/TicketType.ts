export interface TicketType {
  id: number;
  subject: string;
  message: string;
  type: string;
  status: string;
  senderId: number;
  senderName: string;
  recipientId: number | null;
  recipientName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketReplyType {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface AddTicketDto {
  subject: string;
  message: string;
  type: string;
  recipientId?: number;
}

export interface UpdateTicketDto {
  id: number;
  status?: string;
  recipientId?: number;
}

export interface AddTicketReplyDto {
  ticketId: number;
  message: string;
}
