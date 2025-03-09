import React from 'react'
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { ListTodo } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Link, Outlet, useLocation } from 'react-router'
import { UserNav } from '../ui/Layouts/user-nav'

import CafeIcon from '../../assets/SVG/coffee-cup-coffee.svg?react';
import Dashboard from '../../assets/SVG/Dashboard.svg?react';
import Menu from '../../assets/SVG/menu.svg?react';
import { cn } from '@/lib/utils'

const sideBarData = [
    {
        title: 'Dashboard',
        icon: <Dashboard className='size-6' />,
        link: '/dashboard',
        isCollapsible: false,
    },
    {
        title: 'Menu ',
        icon: <Menu />,
        link: '/menu-management',
        isCollapsible: false,
    }
]



export default function Sidebar({
    isfullScreen
}) {

    if (isfullScreen) {
        return <Outlet />;
    }


    const location = useLocation()

    const isActive = (link) => {
        return location.pathname.split('/')[1] === link.split('/')[1]
    }

    const isActiveSubMenu = (link) => {
        return location.pathname.split('/')[2] === link.split('/')[2]
    }

    return (
        <SidebarProvider>
            <SidebarComponent className={cn('shadow')} collapsible="icon" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }} >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link className="flex justify-center items-center gap-2 my-2 w-full tw-no-underline tw-text-inherit" to={'/'}>
                                <CafeIcon />
                                <b className="text-lg tracking-[0.1em] group-data-[collapsible=icon]:hidden">CaféBite</b>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {
                                sideBarData.map((item) => (
                                    <React.Fragment key={item.title}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.link)}
                                                tooltip={item.title}
                                            >
                                                <Link className="tw-no-underline tw-text-inherit" to={item.link}>
                                                    {item?.icon && item.icon}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </React.Fragment>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarComponent>
            <SidebarInset className={cn('h-full w-full min-w-0')} >
                <header className={cn("sticky flex h-12 shrink-0 top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary px-4")}>
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    <div className="flex gap-2 flex-1 items-center justify-end">
                        <Separator orientation="vertical" className="h-6" />
                        <UserNav />
                    </div>
                </header>
                <main className="flex-1 overflow-auto md:p-2 lg:p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
