import { api, authApi, handleApiError } from "@/utils/api";

export const checkUserExists = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/check', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const verifyUserPassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/verify-password', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const verifyOneTimePassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/verify-otp', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const sendOneTimePassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/send-otp', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const checkUserSession  = async () => {
    try {
        const response = await api.get(`/auth/session/active`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const requestPasswordReset = async (userData) => {
    try {
        const response = await authApi.get(`/auth/password/forgot/${userData}`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const performPasswordReset = async (userData) => {
    try {
        const response = await authApi.post('/auth/password/reset', userData);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const validateResetToken  = async (token) => {
    try {
        const response = await authApi.get(`/auth/password/check-reset-token/${token}`);
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}

export const logoutUser = async () => {
    try {
        const response = await authApi.get('/auth/session/logout');
        return { success: true, data: response.data };
    } catch (error) {
        throw handleApiError(error)
    }
}