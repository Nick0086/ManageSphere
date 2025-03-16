import { api, handleApiError } from "@/utils/api";

export const getAllQrCode = async () => {
    try {
        const response = await api.get('/tables');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}
export const getTableById = async (tableId) => {
    try {
        const response = await api.get(`/tables/${tableId}`);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createQrCode = async (data) => {
    try {
        const response = await api.post('/tables', data);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateQrCode = async (data) => {
    try {
        const response = await api.put(`/tables/${data?.qrCodeId}`, data?.qrCodeData);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}