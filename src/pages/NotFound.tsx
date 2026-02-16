import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">Sidan kunde inte hittas.</p>
      <Button onClick={() => navigate("/")}>Tillbaka till startsidan</Button>
    </div>
  );
}
