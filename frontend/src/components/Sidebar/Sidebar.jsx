import React from 'react'
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { LayoutDashboard, ListTodo } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Link, useLocation } from 'react-router'

const sideBarData = [
    {
        title: 'Dashboard',
        icon: <LayoutDashboard size={16} />,
        link: '/dashboard',
        isCollapsible: false,
    },
    {
        title: 'To-Dos',
        icon: <ListTodo  size={16} />,
        link: '/todos',
        isCollapsible: false,
    },
]



export default function Sidebar({ children }) {

    const location = useLocation()

    const isActive = (link) => {
        return location.pathname.split('/')[1] === link.split('/')[1]
    }

    const isActiveSubMenu = (link) => {
        return location.pathname.split('/')[2] === link.split('/')[2]
    }
    return (
        <SidebarProvider>
            <SidebarComponent className='tw-shadow-xl' collapsible="icon" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }} >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex justify-center items-center gap-2 my-2">
                                <Link className="tw-no-underline tw-text-inherit" to={'/'}>
                                    <b className="text-lg tracking-[0.1em] group-data-[collapsible=icon]:hidden">Managesphere</b>
                                </Link>
                            </div>

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
            <SidebarInset className='h-full w-full min-w-0' >
                <header className="sticky flex h-12 shrink-0 top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    <div className="flex gap-2 flex-1 items-center justify-end">
                    </div>
                </header>
                <div className="flex-1 overflow-auto md:p-2 lg:p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
