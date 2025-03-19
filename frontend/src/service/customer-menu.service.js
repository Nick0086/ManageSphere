import { authApi, handleApiError } from "@/utils/api";


export const getMenuForCustomerByTableId = async ({ tableId, userId }) => {
    try {
        const response = await authApi.get(`/customer-menu/template/${tableId}/${userId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getMenuCategoryForConsumer = async (userId) => {
    try {
        const response = await authApi.get(`/customer-menu/category/${userId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getMenuItemsForConsumer = async (userId) => {
    try {
        const response = await authApi.get(`/customer-menu/items/${userId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}