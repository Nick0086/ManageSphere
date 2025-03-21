import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import {
    getMenuCategoryForConsumer,
    getMenuForCustomerByTableId,
    getMenuItemsForConsumer,
} from '@/service/customer-menu.service';
import { customerMenuQueryKeyLoopUp, visibleHandler } from './utils';
import { toastError } from '@/utils/toast-utils';
import { ErrorState } from '../ui/error';
import SlackLoader from '../ui/CustomLoaders/SlackLoader';
import { DEFAULT_SECTION_THEME } from '../Menu/Templates/utils';
import CustomerMenuViewer from './CustomerMenuViewer';
import { OrderHistoryProvider, OrderProvider } from '@/contexts/order-management-context';
import { OrderDrawer } from './OrderDrawer';

export default function CustomerMenuIndex() {
    const { restaurantId, tableId } = useParams();

    // Fetch the menu template for the current table and restaurant.
    const { data: templateData, isLoading: isLoadingTemplate, error: templateError } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['TEMPLATE'], restaurantId, tableId],
        queryFn: () => getMenuForCustomerByTableId({ tableId: restaurantId, userId: tableId })
    });

    // Fetch categories and menu items.
    const { data: categoryData, isLoading: isLoadingCategories, error: categoryError, } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['MENU_ITEMS'], restaurantId],
        queryFn: () => getMenuCategoryForConsumer(restaurantId)
    });

    const { data: menuItemsData, isLoading: isLoadingMenuItems, error: menuItemsError, } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['CATEGORY'], restaurantId],
        queryFn: () => getMenuItemsForConsumer(restaurantId)
    });

    // Centralized error handling with toasts.
    useEffect(() => {
        if (templateError) {
            toastError(`Error fetching menu template: ${JSON.stringify(templateError)}`);
        }
        if (categoryError) {
            toastError(`Error fetching category list: ${JSON.stringify(categoryError)}`);
        }
        if (menuItemsError) {
            toastError(`Error fetching menu items: ${JSON.stringify(menuItemsError)}`);
        }
    }, [templateError, categoryError, menuItemsError]);

    const menuTemplate = templateData?.menuTemplate;

    // Build a mapping of menu items grouped by category.
    const menuItemsByCategory = useMemo(() => {
        if (!menuItemsData?.menuItems) return {};

        // Build a map of items already defined in the template configuration.
        const configCategories = menuTemplate?.config?.categories || [];
        const existingItemsByCategory = configCategories.reduce((acc, category) => {
            acc[category.unique_id] = category.items || [];
            return acc;
        }, {});

        // Group all fetched menu items by category and include only active items.
        const allItemsByCategory = menuItemsData?.menuItems.reduce((acc, item) => {
            const categoryId = item.category_id || 'Uncategorized';
            if (item.status) {
                if (!acc[categoryId]) acc[categoryId] = [];
                acc[categoryId].push({ ...item, visible: true });
            }
            return acc;
        }, {});

        // Merge items from the template config with new items, avoiding duplicates.
        return Object.entries(allItemsByCategory).reduce((result, [categoryId, items]) => {
            const existingItems = existingItemsByCategory[categoryId] || [];
            const existingItemIds = new Set(existingItems.map((item) => item.unique_id));
            const newItems = items.filter((item) => !existingItemIds.has(item.unique_id));
            result[categoryId] = [...existingItems, ...newItems];
            return result;
        }, {});
    }, [menuItemsData, menuTemplate]);

    // Process and combine categories from fetched data and template configuration.
    const processedCategories = useMemo(() => {
        if (!categoryData?.categories) return [];

        // Only include active categories.
        const activeCategories = categoryData.categories.filter((category) => category.status);
        const configCategories = menuTemplate?.config?.categories || [];
        const configCategoryIds = new Set(configCategories.map((cat) => cat.unique_id));

        // Identify new categories not already in the config.
        const newCategories = activeCategories.filter((category) => !configCategoryIds.has(category.unique_id));
        const combinedCategories = [...configCategories, ...newCategories];

        return combinedCategories.map((category) => ({
            unique_id: category.unique_id,
            name: category.name,
            status: category.status,
            visible: visibleHandler(category.visible),
            style: category.style || DEFAULT_SECTION_THEME,
            items: menuItemsByCategory[category.unique_id] || [],
        }));
    }, [categoryData, menuItemsByCategory, menuTemplate]);

    // Derive a complete menu template configuration for rendering.
    const derivedTemplateConfig = useMemo(() => {
        if (!menuTemplate) return {};
        return {
            user_id: menuTemplate.user_id,
            unique_id: menuTemplate.unique_id,
            name: menuTemplate.name,
            global: menuTemplate.config?.global,
            styling: menuTemplate.config?.styling,
            categories: processedCategories,
        };
    }, [menuTemplate, processedCategories]);

    // Combine all loading states.
    const isLoading = isLoadingTemplate || isLoadingCategories || isLoadingMenuItems;
    const hasError = templateError || categoryError || menuItemsError;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <SlackLoader />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <ErrorState />
            </div>
        );
    }

    return (
        <OrderProvider>
            <div className="relative">
                <CustomerMenuViewer menuConfig={derivedTemplateConfig} />
                <OrderHistoryProvider restaurantId={restaurantId} tableId={tableId} >
                    <OrderDrawer />
                </OrderHistoryProvider>
            </div>
        </OrderProvider>

    )
}
