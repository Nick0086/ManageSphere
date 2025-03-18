import {  authApi, handleApiError } from "@/utils/api";


export const getMenuForCustomerByTableId = async ({ tableId, userId }) => {
    try {
        const response = await authApi.get(`/customer-menu/${tableId}/${userId}`);
        return  response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}