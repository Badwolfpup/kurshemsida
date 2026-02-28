import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/api/TicketService";
import type { AddTicketDto, UpdateTicketDto, AddTicketReplyDto, AddTicketTimeSuggestionDto, RespondToTimeSuggestionDto } from "@/Types/TicketType";

/** SCENARIO: Fetches all tickets for the current user; used to derive unread state for the sidebar badge */
export function useTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.fetchTickets,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useAddTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddTicketDto) => ticketService.addTicket(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTicketDto) => ticketService.updateTicket(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTicketReplies(ticketId: number) {
  return useQuery({
    queryKey: ["ticketReplies", ticketId],
    queryFn: () => ticketService.fetchReplies(ticketId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: ticketId > 0,
  });
}

export function useAddTicketReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddTicketReplyDto) => ticketService.addReply(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticketReplies", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTicketTimeSuggestions(ticketId: number) {
  return useQuery({
    queryKey: ["ticketTimeSuggestions", ticketId],
    queryFn: () => ticketService.fetchTimeSuggestions(ticketId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: ticketId > 0,
  });
}

export function useAddTicketTimeSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddTicketTimeSuggestionDto) => ticketService.addTimeSuggestion(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTimeSuggestions", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useRespondToTimeSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; ticketId: number; dto: RespondToTimeSuggestionDto }) =>
      ticketService.respondToTimeSuggestion(params.id, params.dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTimeSuggestions", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useMarkTicketViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: number) => ticketService.markTicketViewed(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
