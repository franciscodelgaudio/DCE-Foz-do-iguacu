"use client";

import Link from "next/link";
import Image from "next/image";

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const LOGO_SRC = "/images/home/logo.png";

export function NavHeader() {
    return (
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link
                        href="/dashboard"
                        prefetch={false}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-sm
                                   hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors
                                   group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:gap-0"
                    >
                        <span className="relative size-20 group-data-[collapsible=icon]:size-8 overflow-hidden rounded-full border bg-white shrink-0 transition-all duration-200">
                            <Image
                                src={LOGO_SRC}
                                alt="DCE"
                                fill
                                className="object-contain p-1"
                                priority
                            />
                        </span>

                        <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
                            <div className="text-sm font-semibold truncate">DCE</div>
                            <div className="text-xs text-muted-foreground truncate">
                                Dashboard
                            </div>
                        </div>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
