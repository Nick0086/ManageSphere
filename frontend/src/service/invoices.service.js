import { api, handleApiError } from "@/utils/api";

export const createInvoiceTemplate = async (data) => {
    try {
        const response = await api.post('/invoice/', data);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateInvoiceTemplate = async (data) => {
    try {
        const response = await api.put(`/invoice/${data?.templateId}`, data);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getAllInvoiceTemplates = async () => {
    try {
        const response = await api.get('/invoice/');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getInvoiceTemplateById = async (templateId) => {
    try {
        const response = await api.get(`/invoice/${templateId}`);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getAllInvoiceTemplatesWithItems = async () => {
    try {
        const response = await api.get('/invoice/items');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getInvoiceTemplateByIdWithItems = async (templateId) => {
    try {
        const response = await api.get(`/invoice/items/${templateId}`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const setDefaultInvoiceTemplate = async (templateId) => {
    try {
        const response = await api.put(`/invoice/default/${templateId}`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const captureInvoiceSnapshot = async ({orderId, restaurantId}) => {
    try {
        const response = await api.post(`/invoice/capture-snapshot/${orderId}/${restaurantId}`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const checkSnapshotExists = async (orderId) => {
    try {
        const response = await api.get(`/invoice/check-snapshot/${orderId}`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}