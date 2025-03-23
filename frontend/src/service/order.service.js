import { api, handleApiError } from "@/utils/api";


export const getAllOrder = async ({ offset, limit, filter }) => {
    try {
        const params = new URLSearchParams({ offset, limit });

        const response = await api.post(`/order/all?${params.toString()}`, {filter});
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createOrder = async (order) => {
    try {
        const response = await api.post('/order', order);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}