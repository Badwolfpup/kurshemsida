import { Contact } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

const CoachContact = () => {
  const { data: allUsers = [], isLoading } = useUsers();

  const admins = allUsers.filter((u) => u.authLevel <= 2 && u.isActive && u.firstName !== "Alexandra");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Contact className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Kontakt</h1>
      </div>

      {admins.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
          <p className="text-muted-foreground">Ingen kontaktinformation tillgänglig.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {admins.map((a) => (
            <div key={a.id} className="bg-card rounded-2xl shadow-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground">{a.firstName} {a.lastName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{a.email}</p>
              {a.telephone && <p className="text-sm text-muted-foreground">{a.telephone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachContact;
