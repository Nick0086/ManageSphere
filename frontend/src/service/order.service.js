import { api, handleApiError } from "@/utils/api";


export const createOrder = async (order) => {
    try {
        const response = await api.post('/order',order);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}