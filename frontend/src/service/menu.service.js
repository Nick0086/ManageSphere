import { api, handleApiError } from "@/utils/api";


export const getAllCategory = async () => {
    try {
        const response = await api.get('/menu/category');
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createCategory = async (data) => {
    try {
        const response = await api.post('/menu/category', data);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateCategory = async (data) => {
    try {
        const response = await api.put(`/menu/category/${data?.categoryId}`, data);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

