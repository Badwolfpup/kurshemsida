import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNav } from "@/components/TopNav";
import "./AppLayout.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="app-layout__main-area">
        <TopNav onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="app-layout__content">{children}</main>
      </div>
    </div>
  );
}
