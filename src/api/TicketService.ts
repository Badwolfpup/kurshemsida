import type { TicketType, TicketReplyType, TicketTimeSuggestionType, AddTicketDto, UpdateTicketDto, AddTicketReplyDto, AddTicketTimeSuggestionDto, RespondToTimeSuggestionDto } from "@/Types/TicketType";

const responseAction = (response: Response): void => {
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized. Redirecting to login.");
  } else if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const ticketService = {
  async fetchTickets(): Promise<TicketType[]> {
    const response = await fetch("/api/fetch-tickets", { credentials: "include" });
    responseAction(response);
    return await response.json();
  },

  async addTicket(dto: AddTicketDto): Promise<boolean> {
    const response = await fetch("/api/add-ticket", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async updateTicket(dto: UpdateTicketDto): Promise<boolean> {
    const response = await fetch("/api/update-ticket", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async deleteTicket(id: number): Promise<boolean> {
    const response = await fetch(`/api/delete-ticket/${id}`, {
      credentials: "include",
      method: "DELETE",
    });
    responseAction(response);
    return true;
  },

  async fetchReplies(ticketId: number): Promise<TicketReplyType[]> {
    const response = await fetch(`/api/fetch-ticket-replies/${ticketId}`, { credentials: "include" });
    responseAction(response);
    return await response.json();
  },

  async addReply(dto: AddTicketReplyDto): Promise<boolean> {
    const response = await fetch("/api/add-ticket-reply", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async fetchTimeSuggestions(ticketId: number): Promise<TicketTimeSuggestionType[]> {
    const response = await fetch(`/api/ticket-time-suggestions/${ticketId}`, { credentials: "include" });
    responseAction(response);
    return await response.json();
  },

  async addTimeSuggestion(dto: AddTicketTimeSuggestionDto): Promise<boolean> {
    const response = await fetch("/api/ticket-time-suggestion", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async respondToTimeSuggestion(id: number, dto: RespondToTimeSuggestionDto): Promise<boolean> {
    const response = await fetch(`/api/ticket-time-suggestion/${id}/respond`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: JSON.stringify(dto),
    });
    responseAction(response);
    return true;
  },

  async markTicketViewed(ticketId: number): Promise<void> {
    const response = await fetch(`/api/ticket-view/${ticketId}`, {
      credentials: "include",
      method: "POST",
    });
    responseAction(response);
  },
};
