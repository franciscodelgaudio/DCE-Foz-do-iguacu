import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children, sidebar }) {
    return (
        <SidebarProvider defaultOpen={true}>
            {sidebar}

            <SidebarInset className="flex flex-1 flex-col min-w-0 h-screen">
                {/* TOPBAR (só mobile) - botão abre/fecha sidebar */}
                <header className="md:hidden flex h-14 items-center gap-2 border-b bg-white px-4">
                    <SidebarTrigger />
                    <span className="text-sm font-semibold">Dashboard</span>
                </header>

                <main className="flex-1 overflow-auto scrollbar-gutter-stable">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
