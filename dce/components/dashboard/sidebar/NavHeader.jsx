"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";

export function NavHeader() {
    return (
        <SidebarGroup>
            <SidebarMenu>
                <Collapsible asChild defaultOpen={false}>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="h-auto py-3">
                            <Link
                                href="/dashboard"
                                prefetch={false}
                                className="flex items-center gap-3"
                            >
                                {/* Logo */}
                                <span className="relative size-20 overflow-hidden rounded-full border bg-white shrink-0">
                                    <Image
                                        src="/images/home/logo.png"
                                        alt="DCE"
                                        fill
                                        className="object-contain p-1"
                                        priority
                                    />
                                </span>

                                {/* Texto (some quando sidebar estiver colapsada/ícone-only) */}
                                <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                                    <div className="text-sm font-semibold truncate">DCE</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        Dashboard
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>

                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}
