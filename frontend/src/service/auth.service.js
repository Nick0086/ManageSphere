import { api, authApi, handleApiError } from "@/utils/api";

export const userVerified = async (userData) => {
    try {
        const response = await authApi.post('/auth/check-user', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const verifyPassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/verify-password', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const verifyOPT = async (userData) => {
    try {
        const response = await authApi.post('/auth/verify-otp', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const sendOTP = async (userData) => {
    try {
        const response = await authApi.post('/auth/send-otp', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const checkUserToken = async () => {
    try {
        const response = await api.get(`/auth/check-user-session`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const forgotPassword = async (userData) => {
    try {
        const response = await authApi.get(`/auth/forgot-password/${userData}`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const resetPassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/reset-password', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const resetPassowrdTokenCheck = async (token) => {
    try {
        const response = await authApi.get(`/check-reset-token/${token}`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const logOut = async () => {
    try {
        const response = await authApi.get('/auth/log-out');
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}