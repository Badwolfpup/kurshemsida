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
  acceptedStartTime?: string | null;
  acceptedEndTime?: string | null;
  hasPendingSuggestion?: boolean;
  hasUnread?: boolean;
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

export interface TicketTimeSuggestionType {
  id: number;
  ticketId: number;
  suggestedById: number;
  suggestedByName: string;
  startTime: string;
  endTime: string;
  status: string;
  declineReason: string | null;
  createdAt: string;
}

export interface AddTicketTimeSuggestionDto {
  ticketId: number;
  startTime: string;
  endTime: string;
}

export interface RespondToTimeSuggestionDto {
  accept: boolean;
  declineReason?: string;
}
