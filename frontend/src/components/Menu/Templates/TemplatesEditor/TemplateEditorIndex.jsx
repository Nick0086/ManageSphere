import React, { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sidebar as SidebarComponent,
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { createTemplate, getAllCategory, getAllMenuItems, getTemplateById, updateTemplate } from '@/service/menu.service';
import { DEFAULT_SECTION_THEME, templateDefaultValue, templateQueryKeyLoopUp } from '../utils';
import PulsatingDots from '@/components/ui/loaders/PulsatingDots';
import SideBarHeader from './components/sidebar-header';
import TemplateSideBarTabs from './TemplateSideBarTabs';
import TemplateMenuViewerLayout from './template-menu-viewer-layout';
import { useTemplate } from '@/contexts/TemplateContext';
import { useParams } from 'react-router';
import { Card } from '@/components/ui/card';


export default function TemplateEditorIndex() {

  const queryClient = useQueryClient();
  const { templateId } = useParams();
  const {currentSection, setCurrentSection, setNameError, setBackgroundColor, setSectionBackgroundColor, setTitleColor, setCardTitleColor, setCardBackgroundColor, setDescriptionColor, setButtonBackgroundColor, setButtonLabelColor } = useTemplate();

  const [templateConfig, setTemplateConfig] = useState(templateDefaultValue);
  const [templateName, setTemplateName] = useState('Default Template');
  const [currenctCategoryItems, setCurrenctCategoryItems] = useState(null);

  const visibleHandler = (value) => {
    if(value === false){
      return false;
    }

    return true
  }


  const { data: templateData, isLoading, error, isError } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_LIST'], templateId],
    queryFn: () => getTemplateById(templateId),
    enabled: !!templateId
  });

  useEffect(() => {
    if (templateData?.template) {
      const { name, config } = templateData.template;
      setTemplateName(name);
      setTemplateConfig(config);
      setBackgroundColor(config?.global?.background_color);
      setSectionBackgroundColor(config?.global?.section_background_color);
      setTitleColor(config?.global?.title_color);
      setCardTitleColor(config?.global?.card_title_color);
      setCardBackgroundColor(config?.global?.card_background_color);
      setDescriptionColor(config?.global?.description_color);
      setButtonBackgroundColor(config?.global?.button_background_color);
      setButtonLabelColor(config?.global?.button_label_color);
    }
  }, [templateData]);

  const shouldFetchDependentData = !templateId || !!templateData;

  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_CATEGORY_LIST']],
    queryFn: getAllCategory,
    enabled: shouldFetchDependentData,
  });

  const { data: menuItemData, isLoading: isMenuItemLoading, error: menuItemError } = useQuery({
    queryKey: [templateQueryKeyLoopUp['TEMPLATE_ITEM_LIST']],
    queryFn: getAllMenuItems,
    enabled: (shouldFetchDependentData && !!categoryData),
  });

  useEffect(() => {
    if (error) {
      toastError(`Error fetching Template Data: ${error?.message || JSON.stringify(error)}`);
    }

    if (categoryError) {
      toastError(`Error fetching categories: ${categoryError?.message || JSON.stringify(categoryError)}`);
    }

    if (menuItemError) {
      toastError(`Error fetching menu items: ${menuItemError?.message || JSON.stringify(menuItemError)}`);
    }
  }, [categoryError, menuItemError]);


  const menuItemsByCategory = useMemo(() => {
    if (!menuItemData?.data?.menuItems) return {};

    const existingItemsByCategoryId = {};
    templateData?.template?.config?.categories?.forEach(category => {
      existingItemsByCategoryId[category.unique_id] = category.items || [];
    });

    const allMenuItemsByCategoryId = menuItemData.data.menuItems.reduce((acc, item) => {
      const categoryId = item?.category_id || "Uncategorized";
      if (!acc[categoryId]) acc[categoryId] = [];
      if (item.status) {
        acc[categoryId].push({ ...item, visible: true });
      }
      return acc;
    }, {});

    return Object.entries(allMenuItemsByCategoryId).reduce((result, [categoryId, menuItems]) => {
      const existingItems = existingItemsByCategoryId[categoryId] || [];
      const existingItemIds = new Set(existingItems.map(item => item.unique_id));
      const newItems = menuItems.filter(item => !existingItemIds.has(item.unique_id));

      result[categoryId] = [...existingItems, ...newItems];
      return result;
    }, {});
  }, [menuItemData, templateData]);

  const processedCategories = useMemo(() => {
    if (!categoryData?.data?.categories) return [];

    const allCategories = categoryData.data.categories.filter(category => category.status);
    const existingCategories = templateData?.template?.config?.categories || [];
    const existingCategoryIds = new Set(existingCategories.map(category => category.unique_id));

    const newCategories = allCategories.filter(category => !existingCategoryIds.has(category.unique_id));

    const combinedCategories = [...existingCategories, ...newCategories];

    return combinedCategories.map(category => ({
      unique_id: category.unique_id,
      name: category.name,
      status: category.status,
      visible: visibleHandler(category?.visible),
      style: category.style || DEFAULT_SECTION_THEME,
      items: menuItemsByCategory[category.unique_id] || []
    }));
  }, [categoryData, menuItemsByCategory, templateData]);

  useEffect(() => {
    if (processedCategories.length > 0) {
      setCurrenctCategoryItems(currenctCategoryItems || processedCategories[0]?.unique_id || null)
      setCurrentSection(currentSection || processedCategories[0]?.unique_id || null)
      setTemplateConfig((prev) => ({
        ...prev,
        categories: processedCategories
      }));
    }
  }, [processedCategories]);

  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: (res) => {
      queryClient.invalidateQueries(templateQueryKeyLoopUp['TEMPLATE_LIST']);
      toastSuccess(res?.data?.message || `Template ${templateName} added successfully`);
    },
    onError: (error) => {
      toastError(`Error adding Template: ${error?.err?.message}`);
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: (res) => {
      queryClient.invalidateQueries(templateQueryKeyLoopUp['TEMPLATE_LIST']);
      toastSuccess(res?.data?.message || `Template ${templateName} updated successfully`);
    },
    onError: (error) => {
      toastError(`Error updating Template: ${error?.err?.message}`);
    }
  });

  const handleFormSubmit = () => {

    if (!!(!templateName)) {
      setNameError('Please select a template name')
      return;
    }

    const obj = { name: templateName, config: templateConfig }
    if (!!templateId) {
      updateTemplateMutation.mutate({ templateId: templateId, templateData: obj });
    } else {
      createTemplateMutation.mutate(obj);
    }
  };

  if (isCategoryLoading || isMenuItemLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulsatingDots size={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="flex justify-center items-center h-screen">
        <p>Somthing Went Wrong</p>
      </Card>
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

        <SideBarHeader templateName={templateName} setTemplateName={setTemplateName} handleFormSubmit={handleFormSubmit} isSubmitting={createTemplateMutation?.isPending || updateTemplateMutation?.isPending} />

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
