import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Layout({ children, sidebar }) {

    return (
        <SidebarProvider defaultOpen={true}>
            {sidebar}
            <SidebarInset className="flex flex-1 flex-col min-w-0 h-screen">
                <main className="flex-1 overflow-auto scrollbar-gutter-stable">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider >
    );
}