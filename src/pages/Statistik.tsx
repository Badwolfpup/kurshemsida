import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeatingStats from "@/components/statistik/SeatingStats";
import AttendanceStats from "@/components/statistik/AttendanceStats";

export default function Statistik() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Statistik</h1>
      </div>
      <Tabs defaultValue="placering">
        <TabsList className="mb-4">
          <TabsTrigger value="placering">Placering</TabsTrigger>
          <TabsTrigger value="narvaro">Närvaro</TabsTrigger>
        </TabsList>
        <TabsContent value="placering">
          <SeatingStats />
        </TabsContent>
        <TabsContent value="narvaro">
          <AttendanceStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
