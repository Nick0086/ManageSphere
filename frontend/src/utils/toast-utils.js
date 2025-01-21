//toast-utils.js
import { toast, Slide } from 'react-toastify';

const defaultOptions = {
    position: "top-right",
    autoClose: 2000,
    transition: Slide,
    hideProgressBar: false,
}

export const toastSuccess = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
}

export const toastError = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, theme: 'colored', ...options });
}

export const toastWarning = (message, options = {}) => {
    toast.warn(message, { ...defaultOptions, theme: 'colored', ...options });
}

export const toastInfo = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, theme: 'colored', ...options });
}

export const toastDefault = (message, options = {}) => {
    toast(message, { ...defaultOptions, theme: 'colored', ...options });
}

// Custom Toast
export const showCustomToast = (message, options = {}) => {
    toast(message, { ...defaultOptions, ...options });
};

// Update Toast (for updating an existing toast)
export const updateToast = (toastId, options = {}) => {
    toast.update(toastId, { ...defaultOptions, ...options });
};

// Dismiss Toast (for dismissing a specific toast)
export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

// Clear All Toasts
export const clearAllToasts = () => {
    toast.dismiss();
};

export { defaultOptions }