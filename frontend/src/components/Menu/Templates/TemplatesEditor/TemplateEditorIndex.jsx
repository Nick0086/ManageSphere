import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sidebar as SidebarComponent,
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { toastError } from '@/utils/toast-utils';
import { getAllCategory, getAllMenuItems } from '@/service/menu.service';
import { DEFAULT_SECTION_THEME, templateDefaultValue, templateQueryKeyLoopUp } from '../utils';
import PulsatingDots from '@/components/ui/loaders/PulsatingDots';
import SideBarHeader from './components/sidebar-header';
import TemplateSideBarTabs from './TemplateSideBarTabs';
import TemplateMenuViewerLayout from './template-menu-viewer-layout';
import {  useTemplate } from '@/contexts/TemplateContext';


export default function TemplateEditorIndex() {

  const { setCurrentSection } = useTemplate();
  const [templateConfig, setTemplateConfig] = useState(templateDefaultValue);
  const [templateName, setTemplateName] = useState('Default Template');
  const [currenctCategoryItems, setCurrenctCategoryItems] = useState(null);


  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_CATEGORY_LIST']],
    queryFn: getAllCategory,
  });

  const { data: menuItemData, isLoading: isMenuItemLoading, error: menuItemError } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_ITEM_LIST']],
    queryFn: getAllMenuItems,
  });

  useEffect(() => {
    if (categoryError) {
      toastError(`Error fetching categories: ${categoryError?.message || JSON.stringify(categoryError)}`);
    }

    if (menuItemError) {
      toastError(`Error fetching menu items: ${menuItemError?.message || JSON.stringify(menuItemError)}`);
    }
  }, [categoryError, menuItemError]);

  const menuItemsByCategory = useMemo(() => {
    const menuItems = menuItemData?.data?.menuItems || [];

    return menuItems.reduce((acc, item) => {
      const categoryId = item?.category_id || "Uncategorized";
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push({ ...item, visible: true });
      return acc;
    }, {});

  }, [menuItemData]);

  const processedCategories = useMemo(() => {
    const categories = categoryData?.data?.categories || [];

    return categories
      .filter(category => category?.status)
      .map(category => ({
        unique_id: category?.unique_id,
        name: category?.name,
        status: category?.status,
        visible: true,
        style: DEFAULT_SECTION_THEME,
        items: menuItemsByCategory[category.unique_id] || []
      }));
  }, [categoryData, menuItemsByCategory]);

  useEffect(() => {
    if (processedCategories.length > 0) {
      setCurrenctCategoryItems(processedCategories[0]?.unique_id || null)
      setCurrentSection(processedCategories[0]?.unique_id || null)
      setTemplateConfig((prev) => ({
        ...prev,
        categories: processedCategories
      }));
    }
  }, [processedCategories]);

  if (isCategoryLoading || isMenuItemLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulsatingDots size={5} />
      </div>
    );
  }

  return (
      <SidebarProvider CUSTOM_SIDEBAR_WIDTH='20rem' className='w-full !min-h-[100dvh] bg-gray-50/50' >

        <SidebarInset className={cn('h-full w-full min-w-0')} >
          <header className="flex h-12 items-center gap-4 border-b bg-background px-6 z-10">
            <h1 className="text-xl font-semibold">{templateName}</h1>
          </header>
          <TemplateMenuViewerLayout templateConfig={templateConfig} />
        </SidebarInset>

        <SidebarComponent className='overflow-auto' side='right' >

          <SideBarHeader templateName={templateName} setTemplateName={setTemplateName} />

          <TemplateSideBarTabs
            categoryData={categoryData}
            isCategoryLoading={isCategoryLoading}
            isMenuItemLoading={isMenuItemLoading}
            templateConfig={templateConfig}
            setTemplateConfig={setTemplateConfig}
            currenctCategoryItems={currenctCategoryItems}
            setCurrenctCategoryItems={setCurrenctCategoryItems}
          />

        </SidebarComponent>
      </SidebarProvider>
  )
}
