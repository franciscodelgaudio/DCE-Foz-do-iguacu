"use client";

import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";
import {
    House,
    FolderKanban,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar";

export default function AppSidebar({ user }) {

    const data = {
        navMain: [
            {
                title: "Home",
                url: `/dashboard`,
                icon: House,
                exact: true,
            },
            {
                title: "Jornal",
                url: `/dashboard/news`,
                icon: FolderKanban,
            },
        ]
    };

    return (
        <Sidebar collapsible="icon"  >
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}