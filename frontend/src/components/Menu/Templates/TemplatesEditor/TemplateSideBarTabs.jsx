import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useState } from 'react'
import TemplateGlobal from './template-global';
import TemplateCategories from './template-categories';
import TemplateStyling from './template-Styling';

export default function TemplateSideBarTabs({
    categoryData,
    isCategoryLoading,
    templateConfig,
    setTemplateConfig

}) {

    const [selectedTab, setSelectedTab] = useState('Global');
    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    }

    return (
        <div className="w-full mx-auto px-0">
            <Tabs value={selectedTab} className='border-none w-full' onValueChange={handleTabChange}>
                <TabsList className="flex overflow-auto w-full border-b border-gray-300">
                    <TabsTrigger value="Global" variant="team" className="text-xs text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700 py-1.5 px-2">
                        Global
                    </TabsTrigger>
                    <TabsTrigger value="categories" variant="team" className="text-xs text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700 py-1.5 px-2">
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="Styling" variant="team" className="text-xs text-yellow-500 border-yellow-500 data-[state=active]:bg-yellow-200 data-[state=active]:text-yellow-700 py-1.5 px-2">
                        Styling
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='Global' ><TemplateGlobal /></TabsContent>

                <TabsContent value='categories' >
                    <TemplateCategories
                        categoryData={categoryData}
                        isCategoryLoading={isCategoryLoading}
                        templateConfig={templateConfig}
                        setTemplateConfig={setTemplateConfig}
                    />
                </TabsContent>

                <TabsContent value='Styling' ><TemplateStyling /></TabsContent>
            </Tabs>
        </div>
    )
}
