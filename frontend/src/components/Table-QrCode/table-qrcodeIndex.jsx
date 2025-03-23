import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import QrCodeToolbar from './table-qrcodeToolBar';
import QrCodeForm from './table-qrcodeForm';
import { useQuery } from '@tanstack/react-query';
import { getAllQrCode } from '@/service/table-qrcode.service';
import { qrCodeQueryKeyLookup } from './utils';
import { toastError } from '@/utils/toast-utils';
import SquareLoader from '../ui/CustomLoaders/SquarLoader';
import QrCodeGrid from './QrCodeGrid';
import { useQrCodeSelection } from './hooks/useQrCodeSelection';
import { usePrintQrCodes } from './hooks/usePrintQrCodes';
import { getAllTemplates } from '@/service/menu.service';

export default function QrCodeManagerIndex() {

    const [modalState, setModalState] = useState({ isOpen: false, isEdit: false, selectedData: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState([]);
    const printFrameRef = useRef(null);

    // Custom hooks for functionality
    const { selectedQrCodes, toggleQrCodeSelection, clearSelections, selectAll } = useQrCodeSelection();
    const { printContent, printQRCode, printSelectedQrCodes: printSelected, printAllQrCodes: printAll } = usePrintQrCodes(printFrameRef, selectedQrCodes, clearSelections);


    const { data, isLoading, error } = useQuery({
        queryKey: [qrCodeQueryKeyLookup['QRCODES']],
        queryFn: getAllQrCode,
    });

    const { data: templates, isLoading: isLoadingTemplates, error: templateError } = useQuery({
        queryKey: [qrCodeQueryKeyLookup['TEMPLATE_LIST']],
        queryFn: getAllTemplates,
    });


    const filteredItems = data?.qrCodes?.filter((item) => {
        const matchesSearch = item?.table_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTemplate = selectedTemplate?.length === 0 || selectedTemplate?.includes(item.template_id);
        return matchesSearch && matchesTemplate;
    });

    useEffect(() => {
        if (error) {
            toastError(`Error fetching QR Codes: ${JSON.stringify(error)}`);
        }
        if (templateError) {
            toastError(`Error fetching templates: ${JSON.stringify(templateError)}`);
        }
    }, [error, templateError]);

    const templateOptions = useMemo(() => {
        return templates?.data?.templates?.map(template => ({
            value: template?.unique_id,
            label: template?.name,
        })) || [];
    }, [templates]);



    // Handler functions for printing
    const handlePrintSelected = () => {
        printSelected(filteredItems);
    };

    const handlePrintAll = () => {
        printAll(filteredItems);
    };

    const handleModalToggle = (state = {}) => {
        setModalState((prev) => ({ ...prev, ...state }));
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedTemplate([]);
    };

    const handleSelectAll = () => {
        if (filteredItems?.length > 0) {
            selectAll(filteredItems);
        }
    };

    if (isLoading || isLoadingTemplates) {
        return (
            <Card className="h-screen w-full transition ease-in-out duration-300">
                <SquareLoader bodyClassName="h-[70%]" />
            </Card>
        );
    }

    return (
        <>
            <QrCodeForm
                open={modalState.isOpen}
                onClose={() => handleModalToggle({ isOpen: false })}
                isEdit={modalState.isEdit}
                selectedData={modalState.selectedData}
                isLoadingTemplates={isLoadingTemplates}
                templateOptions={templateOptions}
            />

            {/* Hidden iframe for printing */}
            <iframe
                ref={printFrameRef}
                style={{ position: 'absolute', height: '0', width: '0', border: '0' }}
                title="Print Frame"
                srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Print QR Codes</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                            }
                            .qr-container {
                                margin: 10px;
                                padding: 15px;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                display: inline-block;
                                width: 250px;
                                text-align: center;
                            }
                            .qr-image {
                                max-width: 200px;
                                height: auto;
                            }
                            .table-number {
                                font-size: 18px;
                                font-weight: bold;
                                margin-bottom: 15px;
                            }
                            @media print {
                                .qr-container {
                                    page-break-inside: avoid;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `}
            />

            <Card className="rounded-lg border">
                <CardHeader className="p-0 pb-2 border-b px-4 pt-3">
                    <div className=" mb-2">
                        <QrCodeToolbar
                            onGenerate={() => handleModalToggle({ isOpen: true })}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedTemplate={selectedTemplate}
                            setSelectedTemplate={setSelectedTemplate}
                            resetFilters={resetFilters}
                            templateOptions={templateOptions}
                            filteredItems={filteredItems}
                            handleSelectAll={handleSelectAll}
                            clearSelections={clearSelections}
                            selectedQrCodes={selectedQrCodes}
                            handlePrintAll={handlePrintAll}
                            handlePrintSelected={handlePrintSelected}
                        />


                    </div>
                </CardHeader>
                <CardContent className="mt-4 px-2">
                    {error ? (
                        <p className="mt-2 flex items-center justify-center h-52 text-2xl font-bold text-primary">Failed to load QR Codes.</p>
                    ) : data?.qrCodes?.length && filteredItems?.length ? (
                        <QrCodeGrid
                            qrCodes={filteredItems}
                            selectedQrCodes={selectedQrCodes}
                            toggleQrCodeSelection={toggleQrCodeSelection}
                            handleModalToggle={handleModalToggle}
                            printQRCode={printQRCode}
                        />
                    ) : (
                        <p className="mt-2 flex items-center justify-center h-52 text-2xl font-bold text-primary">No QR Codes available.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}