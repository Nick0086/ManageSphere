import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router';
import { Coffee, Download, Edit, EllipsisVertical, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import QrCodeCheckbox from './QrCodeCheckbox';

const QrCodeGrid = ({
    qrCodes,
    selectedQrCodes,
    toggleQrCodeSelection,
    handleModalToggle,
    printQRCode
}) => {
    // Function to download QR code as JPG
    const downloadQRCode = (qrId, tableName) => {
        const canvas = document.querySelector(`canvas[data-qrid="${qrId}"]`);
        if (canvas) {
            const link = document.createElement('a');
            link.download = `${tableName}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 1.0);
            link.click();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {qrCodes.map((qr) => (
                <Card key={qr.unique_id} className="shadow-none  p-0 flex flex-col hover:shadow-md relative">
                    {/* Selection checkbox */}


                    <CardHeader className="p-2 pb-0 flex-row items-center justify-between space-y-0">
                        <div className='flex gap-2 items-center justify-start flex-grow-1' >
                            <QrCodeCheckbox
                                id={qr.unique_id}
                                isSelected={selectedQrCodes.includes(qr.unique_id)}
                                onToggle={() => toggleQrCodeSelection(qr.unique_id)}
                            />
                            <CardTitle className="text-xl font-semibold">{qr.table_number}</CardTitle>
                        </div>


                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className='w-auto h-auto hover:bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:shadow-none'
                                >
                                    <EllipsisVertical size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className="cursor-pointer text-sm"
                                    onClick={() => handleModalToggle({ isOpen: true, isEdit: true, selectedData: qr })}
                                >
                                    <Edit size={14} />
                                    <span>Edit Table</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-sm"
                                    onClick={() => printQRCode(qr.unique_id, qr.table_number)}
                                >
                                    <Printer size={14} />
                                    <span>Print QR Code</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-sm"
                                    onClick={() => downloadQRCode(qr.unique_id, qr.table_number)}
                                >
                                    <Download size={14} />
                                    <span>Download as JPG</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center p-2">
                        <div className='border border-primary rounded-lg p-4 w-full flex justify-center'>
                            <QRCodeCanvas
                                data-qrid={qr.unique_id}
                                value={`http://192.168.1.8:5173/menu/${qr.user_id}/${qr.unique_id}`}
                                size={160}
                            />
                        </div>

                        <Link
                            to={`/menu/${qr.user_id}/${qr.unique_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: '100%', textDecoration: 'none' }}
                        >
                            <Button size='sm' className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500 mt-2 w-full'>
                                <Coffee size={16} /> Open Menu
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default QrCodeGrid;