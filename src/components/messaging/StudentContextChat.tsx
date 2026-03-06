import { useThreads } from "@/hooks/useMessages";
import ChatThread from "./ChatThread";
import { useAuth } from "@/contexts/AuthContext";

interface StudentContextChatProps {
  studentId: number;
  otherUserId: number;
}

export default function StudentContextChat({ studentId, otherUserId }: StudentContextChatProps) {
  const { user } = useAuth();
  const { data: threads = [] } = useThreads();

  // Find the thread for this student context between current user and other user
  const thread = threads.find((t) => {
    if (t.studentContextId !== studentId) return false;
    const ids = [t.user1Id, t.user2Id];
    return ids.includes(user?.id ?? 0) && ids.includes(otherUserId);
  });

  return (
    <ChatThread
      threadId={thread?.id ?? null}
      recipientId={otherUserId}
      studentContextId={studentId}
    />
  );
}
