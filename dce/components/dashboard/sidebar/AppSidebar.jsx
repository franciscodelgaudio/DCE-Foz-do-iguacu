"use client"

import { NavUser } from "./NavUser"
import { NavMain } from "./NavMain"
import { House, FolderKanban, CalendarDays, Users, Heart, FileText, LayoutList, Briefcase, Inbox } from "lucide-react"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavHeader } from "./NavHeader"

export default function AppSidebar({ user, isAdmin = false }) {
    const navMain = [
        { title: "Home", url: `/dashboard`, icon: House, exact: true },
        {
            title: "Jornal",
            url: `/dashboard/news`,
            icon: FolderKanban,
            items: [
                { title: "Controle Editorial", url: `/dashboard/news/editorial`, icon: LayoutList },
            ],
        },
        { title: "Eventos", url: `/dashboard/events`, icon: CalendarDays },
        { title: "Correio Elegante", url: `/dashboard/correio-elegante`, icon: Heart },
        { title: "Editais e Atas", url: `/dashboard/documentos`, icon: FileText },
        { title: "Vagas", url: `/dashboard/vagas`, icon: Briefcase },
        { title: "Contatos", url: `/dashboard/contatos`, icon: Inbox },
    ]

    if (isAdmin) {
        navMain.push({ title: "Usuários", url: `/dashboard/usuarios`, icon: Users })
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <NavHeader />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
