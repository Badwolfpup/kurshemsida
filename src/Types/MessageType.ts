export interface ThreadType {
  id: number;
  user1Id: number;
  user1Name: string;
  user1Role: string;
  user2Id: number;
  user2Name: string;
  user2Role: string;
  studentContextId: number | null;
  studentContextName: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    content: string;
    senderId: number;
    senderName: string;
    createdAt: string;
  } | null;
  hasUnread: boolean;
}

export interface MessageType {
  id: number;
  threadId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SendMessageDto {
  recipientId: number;
  content: string;
  studentContextId?: number | null;
}
