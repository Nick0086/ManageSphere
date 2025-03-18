import { getMenuForCustomerByTableId } from '@/service/customer-menu.service';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useParams } from 'react-router'

export default function CustomerMenuIndex() {

    const { restaurantId, tableId } = useParams();

    const { data: templates, isLoading: isLoadingTemplates, error: templateError } = useQuery({
        queryKey: [restaurantId, tableId],
        queryFn: () => getMenuForCustomerByTableId({ tableId: restaurantId, userId: tableId }),
    });

    console.log({ templates })

    return (
        <div>CustomerMenuIndex</div>
    )
}
