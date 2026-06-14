"use client";

import type { Icon } from "@tabler/icons-react";
import { IconLock } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: Icon | React.ComponentType<{ className?: string }>;
  locked?: boolean;
  subItems?: { label: string; url: string }[];
};

export function NavMain({
  items,
  onLockedClick,
}: {
  items: NavItem[];
  onLockedClick?: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item.locked ? (
              // Item verrouillé — cliquable mais ouvre le modal d'upgrade
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={`${item.title} — Plan supérieur requis`}
                  onClick={onLockedClick}
                  className="opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span className="flex-1">{item.title}</span>
                  <IconLock className="h-3 w-3 ml-auto shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a href={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.subItems && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.label}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.label}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
