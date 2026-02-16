import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/api/TicketService";
import type { AddTicketDto, UpdateTicketDto, AddTicketReplyDto } from "@/Types/TicketType";

export function useTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.fetchTickets,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
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
