import { Users } from 'lucide-react';
import HelpDialog from '@/components/HelpDialog';
import AdminUsers from '@/components/admin/AdminUsers';

const HanteraAnvandare = () => (
  <div className="p-6 lg:p-10 max-w-6xl mx-auto">
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
        <Users className="h-5 w-5 text-primary-foreground" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">Hantera användare</h1>
      <HelpDialog helpKey="admin.users" />
    </div>
    <AdminUsers />
  </div>
);

export default HanteraAnvandare;
