import { authApi, handleApiError } from "@/utils/api";

export const userVerified = async (userData) => {
    try {
        const response = await authApi.post('/auth/check-user',userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const verifyPassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/verify-password',userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}