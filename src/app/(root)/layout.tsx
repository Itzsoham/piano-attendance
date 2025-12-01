import { AppSidebar } from "@/app/(root)/_components/app-sidebar";
import { SiteHeader } from "@/app/(root)/_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
