import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CloudUpload, Trash2 } from 'lucide-react';

const EnhancedAttachmentInput = ({ field, disabled, readonly, inputClassName, onValueChange }) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState(field?.value || '');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            field.onChange(file);
            onValueChange?.(file);
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation()
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        field.onChange(null);
        onValueChange?.(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div onClick={triggerFileInput} className={`duration-200  group focus:border-indigo-500 focus:bg-indigo-100/20  bg-indigo-100/10 group hover:bg-indigo-100/20 hover:border-indigo-500 border-indigo-100 border rounded-lg p-1 ${!disabled ? '!cursor-pointer ' : 'cursor-not-allowed !bg-gray-100'} ${inputClassName}`}>
            <div className="flex items-center space-x-4">
                <div className="flex-grow flex items-center space-x-2">
                    <Button
                        className={` border-indigo-500 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 group-hover:bg-indigo-500 group-hover:text-white shadow-sm `}
                        size="sm"
                        variant="addBtn"
                        type="button"
                        disabled={disabled || readonly}
                    >
                        <CloudUpload size={16} className="mr-2" />
                        Choose File
                    </Button>
                    <div className="flex flex-wrap items-center">
                        <span className="text-sm font-semibold break-all">
                            {fileName ? (
                                <>
                                    {typeof fileName === 'object' ?  fileName?.name || 'No file chosen' : fileName}
                                    {fileName && (
                                        <Button
                                            className="bg-transparent hover:text-red-700 text-red-500 hover:bg-transparent border-none h-4 w-4 inline-block"
                                            size="icon"
                                            variant="addBtn"
                                            type="button"
                                            onClick={handleRemoveFile}
                                            disabled={disabled || readonly}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </>
                            ) : (
                                "No file chosen"
                            )}
                        </span>
                    </div>

                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
                disabled={disabled || readonly}
                accept="application/msword,image/gif,image/jpeg,application/pdf,image/png,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,.doc,.gif,.jpeg,.jpg,.pdf,.png,.xls,.xlsx,.zip"
            />
        </div>
    );
};

export default EnhancedAttachmentInput;