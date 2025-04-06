import { api, authApi, handleApiError } from "@/utils/api";


export const getAllOrder = async ({ offset, limit, filter }) => {
    try {
        const params = new URLSearchParams({ offset, limit });

        const response = await api.post(`/order/all?${params.toString()}`, { filter });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createOrder = async (order) => {
    try {
        const response = await authApi.post(`/order/add/${order?.restaurantId}`, order);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateOrderStatus = async (data) => {
    try {
      const response = await authApi.put(`/order/status`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };
