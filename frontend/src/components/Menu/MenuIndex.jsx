import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';

export default function MenuIndex() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState();

    useEffect(() => {
        const path = location.pathname.split('/');
        const tab = path[2]
        setSelectedTab(tab);
    }, [location]);

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        navigate(`/menu-management/${tab}`);
    }

    return (
        <section className="section">
            <div className="w-full p-0 mx-auto">
                <div className='flex flex-wrap '>
                    <Card className='w-full rounded-sm overflow-hidden '>
                        <div className="w-full mx-auto px-0">
                            <Tabs value={selectedTab} className='border-none w-full' onValueChange={handleTabChange}>
                                <TabsList className="flex flex-wrap w-full border-b border-gray-300">
                                    <TabsTrigger value="dashboard" variant="team" className="text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700">
                                        Templates
                                    </TabsTrigger>
                                    <TabsTrigger value="categories" variant="team" className="text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700">
                                        Categories
                                    </TabsTrigger>
                                    <TabsTrigger value="menu-items" variant="team" className="text-yellow-500 border-yellow-500 data-[state=active]:bg-yellow-200 data-[state=active]:text-yellow-700">
                                        Menu Items
                                    </TabsTrigger>
                                </TabsList>
                                <Outlet />
                            </Tabs>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}