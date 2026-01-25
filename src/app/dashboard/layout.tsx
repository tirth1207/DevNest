import "../globals.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="rounded-5xl">
            <header className="flex h-16 rounded-t-3xl shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-40">
              <div className="flex items-center gap-2 rounded-t-3xl min-w-0 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="min-w-0 flex-1">
                  <DynamicBreadcrumb />
                </div>
              </div>
              <div className="flex items-center rounded-t-3xl gap-2">
                <ModeToggle />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-6 bg-background rounded-3xl min-h-[calc(100vh-4rem)] overflow-hidden">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
