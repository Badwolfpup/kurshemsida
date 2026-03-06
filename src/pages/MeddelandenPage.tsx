import { useState, useMemo, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import HelpDialog from "@/components/HelpDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useThreads } from "@/hooks/useMessages";
import { useUsers } from "@/hooks/useUsers";
import ThreadList from "@/components/messaging/ThreadList";
import ChatThread from "@/components/messaging/ChatThread";
import type { ThreadType } from "@/Types/MessageType";

const AUTH_LEVEL_ROLE: Record<number, string> = {
  1: "Admin",
  2: "Teacher",
  3: "Coach",
  4: "Student",
};

type AdminTab = "deltagare" | "coacher";

export default function MeddelandenPage() {
  const { user } = useAuth();
  const { isAdmin, isCoach, isStudent } = useUserRole();
  const { data: threads = [], isLoading } = useThreads();
  const { data: allUsers = [] } = useUsers();
  const [selectedThread, setSelectedThread] = useState<ThreadType | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>("deltagare");

  const getOtherUserId = (thread: ThreadType) =>
    thread.user1Id === user?.id ? thread.user2Id : thread.user1Id;

  const getOtherUserRole = (thread: ThreadType) =>
    thread.user1Id === user?.id ? thread.user2Role : thread.user1Role;

  // Build merged list: real threads + virtual entries for users without threads
  const mergedThreads = useMemo(() => {
    if (!user) return [];

    const directThreads = threads.filter((t) => !t.studentContextId);

    // Determine which users should be messageable
    const myProfile = allUsers.find((u) => u.id === user.id);
    let messageableUsers = allUsers.filter((u) => u.id !== user.id && u.isActive);
    if (isStudent) {
      // Students can message admins, teachers, and their coach
      const myCoachId = myProfile?.coachId;
      messageableUsers = messageableUsers.filter(
        (u) => u.authLevel <= 2 || (u.authLevel === 3 && u.id === myCoachId)
      );
    } else if (isCoach) {
      // Coaches can message admins, teachers, and their students
      messageableUsers = messageableUsers.filter(
        (u) => u.authLevel <= 2 || (u.authLevel === 4 && u.coachId === user.id)
      );
    }
    // Admin/Teacher: all active users

    // Find users that already have a direct thread
    const usersWithThread = new Set(
      directThreads.map((t) => (t.user1Id === user.id ? t.user2Id : t.user1Id))
    );

    // Create virtual threads for users without an existing thread
    const virtualThreads: ThreadType[] = messageableUsers
      .filter((u) => !usersWithThread.has(u.id))
      .map((u) => ({
        id: -u.id, // negative ID = virtual
        user1Id: Math.min(user.id, u.id),
        user1Name:
          Math.min(user.id, u.id) === user.id
            ? `${user.firstName} ${user.lastName}`
            : `${u.firstName} ${u.lastName}`,
        user1Role:
          Math.min(user.id, u.id) === user.id
            ? AUTH_LEVEL_ROLE[user.authLevel] ?? ""
            : AUTH_LEVEL_ROLE[u.authLevel] ?? "",
        user2Id: Math.max(user.id, u.id),
        user2Name:
          Math.max(user.id, u.id) === user.id
            ? `${user.firstName} ${user.lastName}`
            : `${u.firstName} ${u.lastName}`,
        user2Role:
          Math.max(user.id, u.id) === user.id
            ? AUTH_LEVEL_ROLE[user.authLevel] ?? ""
            : AUTH_LEVEL_ROLE[u.authLevel] ?? "",
        studentContextId: null,
        studentContextName: null,
        createdAt: "",
        updatedAt: "",
        lastMessage: null,
        hasUnread: false,
      }));

    // Sort: real threads by updatedAt desc, then virtual threads alphabetically
    const sortedVirtual = virtualThreads.sort((a, b) => {
      const nameA = a.user1Id === user.id ? a.user2Name : a.user1Name;
      const nameB = b.user1Id === user.id ? b.user2Name : b.user1Name;
      return nameA.localeCompare(nameB, "sv");
    });

    return [...directThreads, ...sortedVirtual];
  }, [threads, allUsers, user, isStudent, isCoach]);

  // Filter for admin tabs
  const filteredThreads = isAdmin
    ? mergedThreads.filter((t) => {
        const otherRole = getOtherUserRole(t);
        return adminTab === "deltagare"
          ? otherRole === "Student"
          : otherRole === "Coach";
      })
    : mergedThreads;

  // When a virtual thread becomes real (after first message), update selection
  useEffect(() => {
    if (selectedThread && selectedThread.id < 0) {
      const otherUserId = getOtherUserId(selectedThread);
      const realThread = threads.find(
        (t) =>
          !t.studentContextId &&
          (t.user1Id === otherUserId || t.user2Id === otherUserId)
      );
      if (realThread) {
        setSelectedThread(realThread);
      }
    }
  }, [threads]);

  const handleSelectThread = (thread: ThreadType) => {
    setSelectedThread(thread);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Meddelanden
        </h1>
        <span className="text-xl sm:text-2xl font-display text-muted-foreground">
          — Skriv aldrig känsliga uppgifter här!
        </span>
        <div className="ml-auto">
          <HelpDialog helpKey="meddelanden" />
        </div>
      </div>

      {/* Admin tabs */}
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={() => { setAdminTab("deltagare"); setSelectedThread(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              adminTab === "deltagare"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Deltagare
          </button>
          <button
            onClick={() => { setAdminTab("coacher"); setSelectedThread(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              adminTab === "coacher"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Coacher
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thread list */}
          <div>
            <ThreadList
              threads={filteredThreads}
              selectedThreadId={selectedThread?.id ?? null}
              onSelect={handleSelectThread}
            />
          </div>

          {/* Chat area */}
          <div>
            {selectedThread ? (
              <ChatThread
                threadId={selectedThread.id > 0 ? selectedThread.id : null}
                recipientId={getOtherUserId(selectedThread)}
              />
            ) : (
              <div className="bg-card rounded-2xl shadow-card border border-border p-6 text-center text-muted-foreground">
                Välj en konversation för att visa meddelanden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
