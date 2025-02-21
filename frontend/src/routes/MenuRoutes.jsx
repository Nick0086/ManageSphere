import CategoriesIndex from '@/components/Menu/Categories/CategoriesIndex'
import DashBoardIndex from '@/components/Menu/Dashboard/DashBoardIndex'
import MenuIndex from '@/components/Menu/MenuIndex'
import MenuItemsIndex from '@/components/Menu/MenuItems/MenuItemsIndex'
import { TabsContent } from '@/components/ui/tabs'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router'

export default function MenuRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MenuIndex />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TabsContent value="dashboard"><DashBoardIndex/></TabsContent>} />
                <Route path="categories" element={<TabsContent value="categories"><CategoriesIndex/></TabsContent>} />
                <Route path="menu-items" element={<TabsContent value="menu-items"><MenuItemsIndex/></TabsContent>} />
                <Route path="*" element={<Navigate to="/menu-management/dashboard" replace />} />
            </Route>
        </Routes>
    )
}
