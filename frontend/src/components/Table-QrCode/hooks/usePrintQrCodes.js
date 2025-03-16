import { useState } from 'react';
import { toastError } from '@/utils/toast-utils';

export const usePrintQrCodes = (printFrameRef, selectedQrCodes, clearSelections) => {
    const [printContent, setPrintContent] = useState("");
    const [printDialogOpen, setPrintDialogOpen] = useState(false);

    // Core print function
    const printQrCodes = (content) => {
        setPrintContent(content);
        setPrintDialogOpen(true);

        // Use setTimeout to ensure the content is rendered before printing
        setTimeout(() => {
            if (printFrameRef.current) {
                const iframe = printFrameRef.current;
                const iframeWindow = iframe.contentWindow || iframe;

                try {
                    iframe.focus();
                    iframeWindow.print();

                    // Reset selection after printing
                    clearSelections();
                } catch (error) {
                    console.error("Printing failed:", error);
                    toastError("Printing failed. Please try again.");
                }
            }
        }, 500);
    };

    // Function to print a single QR code
    const printQRCode = (qrId, tableName) => {
        const canvas = document.querySelector(`canvas[data-qrid="${qrId}"]`);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');

            const content = `
        <div class="qr-container">
          <div class="table-number">${tableName}</div>
          <img src="${dataUrl}" class="qr-image" alt="QR Code for ${tableName}" />
        </div>
      `;

            printQrCodes(content);
        }
    };

    // Function to print multiple QR codes
    const printMultipleQrCodes = (qrCodes) => {
        let content = '';

        qrCodes.forEach(qrCode => {
            const canvas = document.querySelector(`canvas[data-qrid="${qrCode.unique_id}"]`);
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                content += `
          <div class="qr-container">
            <div class="table-number">${qrCode.table_number}</div>
            <img src="${dataUrl}" class="qr-image" alt="QR Code for ${qrCode.table_number}" />
          </div>
        `;
            }
        });

        printQrCodes(content);
    };

    // Function to print all visible QR codes
    const printAllQrCodes = (filteredItems) => {
        if (filteredItems?.length > 0) {
            printMultipleQrCodes(filteredItems);
        }
    };

    // Function to print selected QR codes
    const printSelectedQrCodes = (filteredItems) => {
        if (selectedQrCodes.length > 0) {
            const selectedItems = filteredItems.filter(qr => selectedQrCodes.includes(qr.unique_id));
            printMultipleQrCodes(selectedItems);
        } else {
            toastError("No QR codes selected. Please select at least one QR code.");
        }
    };

    return {
        printContent,
        printDialogOpen,
        setPrintDialogOpen,
        printQRCode,
        printMultipleQrCodes,
        printAllQrCodes,
        printSelectedQrCodes
    };
};