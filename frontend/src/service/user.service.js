import { authApi, handleApiError } from "@/utils/api";

export const registerUser = async (userData) => {
    try {
        const response = await authApi.post('/user/register',userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}