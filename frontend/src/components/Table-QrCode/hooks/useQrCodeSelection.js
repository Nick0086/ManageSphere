import { useState } from 'react';

export const useQrCodeSelection = () => {
    const [selectedQrCodes, setSelectedQrCodes] = useState([]);

    // Function to toggle QR code selection
    const toggleQrCodeSelection = (qrId) => {
        setSelectedQrCodes(prev => {
            if (prev.includes(qrId)) {
                return prev.filter(id => id !== qrId);
            } else {
                return [...prev, qrId];
            }
        });
    };

    // Function to clear all selections
    const clearSelections = () => {
        setSelectedQrCodes([]);
    };

    // Function to select all QR codes
    const selectAll = (qrCodes) => {
        setSelectedQrCodes(qrCodes.map(qr => qr.unique_id));
    };

    return {
        selectedQrCodes,
        toggleQrCodeSelection,
        clearSelections,
        selectAll
    };
};