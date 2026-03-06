import { useState, useEffect } from "react";
import HelpDialog from "@/components/HelpDialog";
import {
  Settings,
  Sun,
  Moon,
  UserCircle,
  Save,
  Phone,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FeedbackForm from "@/components/FeedbackForm";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateUser, useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

const CoachSettings = () => {
  const { theme, setTheme } = useTheme();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const { data: allUsers = [] } = useUsers();
  const updateUser = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const fullUser = allUsers.find((u) => u.id === user?.id);

  useEffect(() => {
    if (fullUser) {
      setTelephone(fullUser.telephone ?? "");
    }
  }, [fullUser]);

  const handleSave = () => {
    if (!user) return;
    updateUser.mutate(
      { id: user.id, firstName, lastName, telephone },
      {
        onSuccess: () => {
          toast({ title: "Sparad", description: "Dina uppgifter har uppdaterats." });
          setIsEditing(false);
          login();
        },
        onError: () => {
          toast({
            title: "Fel",
            description: "Kunde inte spara ändringarna.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleCancel = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setTelephone(fullUser?.telephone ?? "");
    setIsEditing(false);
  };

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Inställningar</h1>
        <HelpDialog helpKey="coach-installningar" />
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <UserCircle className="h-5 w-5" /> Profil
            </h2>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 text-muted-foreground"
              >
                <Pencil className="h-4 w-4" /> Ändra
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="gradient-hero text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Förnamn
                  </label>
                  <Input value={firstName} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Efternamn
                  </label>
                  <Input value={lastName} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    E-post
                  </label>
                  <Input value={user?.email ?? ""} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Telefon
                  </label>
                  <Input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="070-000 00 00"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateUser.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateUser.isPending ? "Sparar..." : "Spara"}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" /> Avbryt
                </Button>
              </div>
            </>
          ) : (
            <div className="grid gap-2 text-sm">
              {fullUser?.telephone && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {fullUser.telephone}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">Tema</h2>
          <div className="flex gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="h-4 w-4" /> Ljust
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="h-4 w-4" /> Mörkt
            </Button>
          </div>
        </div>

        {/* Bug report / Idea */}
        <FeedbackForm />
      </div>
    </div>
  );
};

export default CoachSettings;
