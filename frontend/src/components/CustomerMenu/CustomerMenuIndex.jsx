import { getMenuCategoryForConsumer, getMenuForCustomerByTableId, getMenuItemsForConsumer } from '@/service/customer-menu.service';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useParams } from 'react-router'
import { customerMenuQueryKeyLoopUp } from './utils';

export default function CustomerMenuIndex() {

    const { restaurantId, tableId } = useParams();

    const { data: templates, isLoading: isLoadingTemplates, error: templateError } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['TEMPLATE'], restaurantId, tableId],
        queryFn: () => getMenuForCustomerByTableId({ tableId: restaurantId, userId: tableId }),
    });

    const { data: categoryList, isLoading: isLoadingCategoryList, error: categoryListError } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['MENU_ITEMS'], restaurantId],
        queryFn: () => getMenuCategoryForConsumer(restaurantId),
    });

    const { data: menuItemsList, isLoading: isLoadingMenuList, error: menuListError } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['CATEGORY'], restaurantId],
        queryFn: () => getMenuItemsForConsumer(restaurantId),
    });

    console.log("CustomerMenuIndex   --> ", { templates, categoryList, menuItemsList })

    return (
        <div>CustomerMenuIndex</div>
    )
}
