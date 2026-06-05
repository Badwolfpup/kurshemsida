import { useThreads } from "@/hooks/useMessages";
import ChatThread from "./ChatThread";

interface StudentContextChatProps {
  studentId: number;
  recipientId: number;
}

export default function StudentContextChat({ studentId, recipientId }: StudentContextChatProps) {
  const { data: threads = [] } = useThreads();

  // Find the thread for this student context (one per coach+student pair)
  const thread = threads.find((t) => t.studentContextId === studentId);

  return (
    <ChatThread
      threadId={thread?.id ?? null}
      recipientId={recipientId}
      studentContextId={studentId}
    />
  );
}
