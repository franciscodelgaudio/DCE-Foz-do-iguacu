"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMain({ title, items }) {
  const pathname = usePathname();

  const isActiveItem = (item) => {
    const resolvedUrl = item.url;
    if (item.exact) return pathname === resolvedUrl;
    return pathname === resolvedUrl || pathname.startsWith(resolvedUrl + "/");
  };

  const isActiveSubItem = (subItem) => {
    const resolvedUrl = subItem.url;
    return pathname === resolvedUrl || pathname.startsWith(resolvedUrl + "/");
  };

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item, index) => {
          return (
            <Collapsible key={index} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActiveItem(item)}
                  className="relative"
                >
                  <Link href={item.url} prefetch={false}>
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length >= 1 && (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem, index) => (
                          <SidebarMenuSubItem key={index}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActiveSubItem(subItem)}
                            >
                              <Link
                                href={subItem.url}
                                prefetch={false}
                              >
                                {subItem.icon && (
                                  <subItem.icon className="w-5 h-5" />
                                )}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}