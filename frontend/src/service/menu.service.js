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

export const getAllMenuItems = async () => {
    try {
        const response = await api.get('/menu/menu-items');
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createMenuItem = async (data) => {
    try {
        const response = await api.post('/menu/menu-items', data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateMenuItem = async (data) => {
    try {
        const response = await api.put(`/menu/menu-items/${data?.menuItemId}`, data?.menuData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getAllTemplates = async () => {
    try {
        const response = await api.get('/menu/template');
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}
export const getTemplateById = async (templateId) => {
    try {
        const response = await api.get(`/menu/template/${templateId}`);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createTemplate = async (data) => {
    try {
        const response = await api.post('/menu/template', data);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateTemplate = async (data) => {
    try {
        const response = await api.put(`/menu/template/${data?.templateId}`, data?.templateData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error);
    }
}
