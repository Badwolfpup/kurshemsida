import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/api/MessageService";
import type { SendMessageDto } from "@/Types/MessageType";

/** SCENARIO: Fetches all threads for the current user with last message and unread flag */
export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: () => Promise.resolve([]), // SUSPENDED: messaging paused for GDPR review
    // queryFn: messageService.getThreads,
    // staleTime: 10_000,
    // refetchInterval: 10_000,
    // refetchOnWindowFocus: true,
  });
}

/** SCENARIO: Fetches paginated messages for a thread (newest first) */
export function useThreadMessages(threadId: number | null, take: number) {
  return useQuery({
    queryKey: ["threadMessages", threadId, take],
    queryFn: () => messageService.getThreadMessages(threadId!, take),
    enabled: threadId !== null,
    staleTime: 10_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * SCENARIO: User sends a message to another user
 * CALLS: POST /api/messages (MessageEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates Thread if first message between users (backend)
 *   - Creates Message record (backend)
 *   - Updates Thread.UpdatedAt (backend)
 *   - Sends email to recipient if EmailNotifications = true (backend, EmailService)
 *   - Invalidates ["threads"] + ["threadMessages"] + ["unreadCount"] cache
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendMessageDto) => messageService.sendMessage(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["threadMessages", data.threadId] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

/**
 * SCENARIO: User marks a thread as viewed
 * CALLS: POST /api/threads/{id}/view (MessageEndpoints.cs)
 * SIDE EFFECTS:
 *   - Upserts ThreadView.LastViewedAt (backend)
 *   - Invalidates ["threads"] + ["unreadCount"] cache
 */
export function useMarkThreadViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: number) => messageService.markThreadViewed(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

/** SCENARIO: Fetches total unread thread count for sidebar badge */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => Promise.resolve(0), // SUSPENDED: messaging paused for GDPR review
    // queryFn: messageService.getUnreadCount,
    // staleTime: 30_000,
    // refetchOnWindowFocus: true,
  });
}

/** SCENARIO: Derives split unread counts from threads — messages vs student-context */
export function useUnreadCounts() {
  const { data: threads = [] } = useThreads();
  let messagesCount = 0;
  let studentContextCount = 0;
  const unreadStudentIds = new Set<number>();
  for (const t of threads) {
    if (!t.hasUnread) continue;
    if (t.studentContextId === null) messagesCount++;
    else {
      studentContextCount++;
      unreadStudentIds.add(t.studentContextId);
    }
  }
  return { messagesCount, studentContextCount, unreadStudentIds };
}
