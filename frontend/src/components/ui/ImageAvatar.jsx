import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ZoomIn, ZoomOut, Save, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

const ImageAvatar = ({ s3ImageUrl, onImageUpload, onDeleteImage }) => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level is 1 (100%)
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Image position
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(false); // Toggle dragging
    const [isDragging, setIsDragging] = useState(false); // Track active dragging
    const fileInputRef = useRef(null);
    const containerRef = useRef(null); // Ref for the container div
    const dragStartRef = useRef({ x: 0, y: 0 }); // Store initial drag position
    const MOVE_STEP = 10; // Pixels to move per button click

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (file && file.size <= maxSize) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                setZoomLevel(1);
                setPosition({ x: 0, y: 0 });
                setIsDraggingEnabled(false);
                onImageUpload(file);
            };
            reader.readAsDataURL(file);
        } else {
            toast.warning("Please upload an image less than 5 MB.");
        }
    };

    // Zoom in function
    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.2, 3));
    };

    // Zoom out function
    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.2, 1));
    };

    // Toggle dragging mode
    const toggleDragging = () => {
        setIsDraggingEnabled((prev) => !prev);
    };

    // Move image functions
    const moveImage = (direction) => {
        const container = containerRef.current;
        if (!container) return;

        const imgWidth = container.offsetWidth * (zoomLevel / 2);
        const imgHeight = container.offsetHeight * (zoomLevel / 2);
        const maxX = (imgWidth - container.offsetWidth) / 2;
        const maxY = (imgHeight - container.offsetHeight) / 2;

        setPosition((prev) => {
            let newX = prev.x;
            let newY = prev.y;

            switch (direction) {
                case 'right':
                    newX = Math.min(maxX, prev.x + MOVE_STEP);
                    break;
                case 'left':
                    newX = Math.max(-maxX, prev.x - MOVE_STEP);
                    break;
                case 'up':
                    newY = Math.max(-maxY, prev.y - MOVE_STEP);
                    break;
                case 'down':
                    newY = Math.min(maxY, prev.y + MOVE_STEP);
                    break;
                default:
                    break;
            }

            return { x: newX, y: newY };
        });
    };


    // Trigger file input
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Start dragging
    const handleMouseDown = (e) => {
        if (isDraggingEnabled && zoomLevel > 1) {
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Handle dragging
    const handleMouseMove = (e) => {
        if (isDragging && isDraggingEnabled) {
            const newX = e.clientX - dragStartRef.current.x;
            const newY = e.clientY - dragStartRef.current.y;

            const container = containerRef.current;
            if (container) {
                const imgWidth = container.offsetWidth * zoomLevel;
                const imgHeight = container.offsetHeight * zoomLevel;
                const maxX = (imgWidth - container.offsetWidth) / 2;
                const maxY = (imgHeight - container.offsetHeight) / 2;

                setPosition({
                    x: Math.max(-maxX, Math.min(maxX, newX)),
                    y: Math.max(-maxY, Math.min(maxY, newY)),
                });
            }
            e.stopPropagation();
        }
    };

    // Stop dragging
    const handleMouseUp = (e) => {
        setIsDragging(false);
        e.stopPropagation();
    };

    // Handle click on container
    const handleContainerClick = (e) => {
        if (!isDragging && !isDraggingEnabled) {
            triggerFileInput();
        }
    };

    return (
        <div className={cn("relative rounded-lg border-2 border-dashed border-gray-200 p-4 flex items-center justify-center ", (uploadedImage || s3ImageUrl) && "")}>
            {/* Image Container */}
            <div
                ref={containerRef}
                className="w-[320px] h-[240px] border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                onClick={handleContainerClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDraggingEnabled && zoomLevel > 1 ? 'grab' : 'pointer' }}
            >
                {(uploadedImage || s3ImageUrl) ? (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg ">
                        <img
                            src={uploadedImage || s3ImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            style={{
                                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease',
                            }}
                            draggable={false}
                        />
                    </div>
                ) : (
                    <span className="text-secondary">No Image</span>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />

            {/* Controls */}
            {(uploadedImage || s3ImageUrl) && (
                <div className="absolute top-2 right-2 flex gap-2 flex-wrap">
                    {/* <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleZoomIn();
                        }}
                    >
                        <ZoomIn size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleZoomOut();
                        }}
                    >
                        <ZoomOut size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant={isDraggingEnabled ? 'grey' : 'outline'}
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDragging();
                        }}
                    >
                        <Move size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            moveImage('up');
                        }}
                        disabled={zoomLevel <= 1} 
                    >
                        <ArrowUp size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            moveImage('down');
                        }}
                        disabled={zoomLevel <= 1}
                    >
                        <ArrowDown size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            moveImage('left');
                        }}
                        disabled={zoomLevel <= 1}
                    >
                        <ArrowLeft size={12} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            moveImage('right');
                        }}
                        disabled={zoomLevel <= 1}
                    >
                        <ArrowRight size={12} />
                    </Button> */}
                    {uploadedImage && (
                        <Button
                            type="button"
                            variant="danger"
                            size="xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUploadedImage(null);
                                setZoomLevel(1);
                                setPosition({ x: 0, y: 0 });
                                setIsDraggingEnabled(false);
                                onDeleteImage();
                            }}
                        >
                            <Trash2 size={12} />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageAvatar;