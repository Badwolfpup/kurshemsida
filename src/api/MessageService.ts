import type { ThreadType, MessageType, SendMessageDto } from "@/Types/MessageType";

const responseAction = (response: Response): void => {
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const messageService = {
  async getThreads(): Promise<ThreadType[]> {
    const response = await fetch("/api/threads", { credentials: "include" });
    responseAction(response);
    return await response.json();
  },

  async getThreadMessages(threadId: number, take: number): Promise<MessageType[]> {
    const response = await fetch(`/api/threads/${threadId}/messages?take=${take}&skip=0`, {
      credentials: "include",
    });
    responseAction(response);
    return await response.json();
  },

  async sendMessage(dto: SendMessageDto): Promise<{ threadId: number; messageId: number }> {
    const response = await fetch("/api/messages", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return await response.json();
  },

  async markThreadViewed(threadId: number): Promise<void> {
    const response = await fetch(`/api/threads/${threadId}/view`, {
      credentials: "include",
      method: "POST",
    });
    responseAction(response);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch("/api/threads/unread-count", { credentials: "include" });
    responseAction(response);
    return await response.json();
  },
};
