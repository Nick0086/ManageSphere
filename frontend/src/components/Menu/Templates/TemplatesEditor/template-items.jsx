import { Button } from '@/components/ui/button';
import SlackLoader from '@/components/ui/CustomLoaders/SlackLoader';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryItem({ item, onToggleVisibility }) {
    // Get sortable properties and methods from dnd-kit
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.unique_id,
        data: { type: 'item', item },
    });

    // Apply transform styles for drag animation
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center bg-white gap-1 px-2 py-1 rounded-md ${isDragging ? 'bg-muted/80' : 'hover:bg-muted/50'} border mb-2`}
        >
            {/* Drag handle */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical size={16} className="text-muted-foreground" />
            </div>

            {/* Category name */}
            <div className="flex-1 truncate text-sm">{item.name}</div>

            {/* Visibility toggle button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleVisibility(item.unique_id)}
                title={item.visible ? 'Hide Category' : 'Show Category'}
            >
                {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </Button>
        </div>
    );
}

export default function TemplateItems({
    isLoading,
    templateConfig,
    categoryData,
    setTemplateConfig,
    currentCategoryItems,
    setCurrentCategoryItems
}) {
    const [currentItemsCategoryObj, setCurrentItemsCategoryObj] = useState(null);
    const [activeDragItem, setActiveDragItem] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require minimum drag distance to prevent accidental drags
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Update the current category object when the selected category changes
    useEffect(() => {
        const currentItemObj = templateConfig?.categories?.find(
            category => category?.unique_id === currentCategoryItems
        );
        setCurrentItemsCategoryObj(currentItemObj);
    }, [currentCategoryItems, templateConfig?.categories]);

    const onChangeCategory = useCallback((categoryId) => {
        setCurrentCategoryItems(categoryId);
    }, [setCurrentCategoryItems]);

    // Create dropdown options from categoryData
    const categoryDataOptions = useMemo(() => {
        const categories = categoryData?.data?.categories || [];
        return categories
            .filter(category => category?.status)
            .map(category => ({
                value: category?.unique_id,
                label: category?.name,
            }));
    }, [categoryData]);

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        setActiveDragItem(active.data.current);
    }, []);

    // Handle the end of a drag operation
    const handleCategoriesDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (!over) return;

        setTemplateConfig((prevConfig) => {
            const updatedCategories = prevConfig.categories.map(category => {
                if (category.unique_id !== currentCategoryItems) {
                    return category;
                }
                // Ensure category.items exists and is an array
                const items = Array.isArray(category.items) ? category.items : [];

                const oldIndex = items.findIndex(item => item.unique_id === active.id);
                const newIndex = items.findIndex(item => item.unique_id === over.id);

                // Validate indices before proceeding
                if (oldIndex === -1 || newIndex === -1) {
                    return category;
                }

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update the current category object with new items
                setCurrentItemsCategoryObj({ ...category, items: newItems });
                return { ...category, items: newItems };
            });

            return { ...prevConfig, categories: updatedCategories };
        });

        setActiveDragItem(null);
    }, [currentCategoryItems, setTemplateConfig]);

    const handleToggleVisibility = useCallback((uniqueId) => {
        setTemplateConfig((prevConfig) => {
            const updatedCategories = prevConfig.categories.map(category => {
                if (category.unique_id !== currentCategoryItems) {
                    return category;
                }
                const updatedItems = Array.isArray(category.items)
                    ? category.items.map(item => {
                        if (item.unique_id === uniqueId) {
                            return { ...item, visible: !item.visible };
                        }
                        return item;
                    })
                    : [];
                return { ...category, items: updatedItems };
            });
            return { ...prevConfig, categories: updatedCategories };
        });
    }, [currentCategoryItems, setTemplateConfig]);

    if (isLoading) {
        return (
            <div className="p-4 h-96 flex items-center justify-center">
                <SlackLoader />
            </div>
        );
    }

    if (!templateConfig?.categories?.length) {
        return <div className="p-4">No Items available.</div>;
    }

    // Ensure items is always defined as an array
    const currentItems = currentItemsCategoryObj?.items || [];

    return (
        <div className="space-y-1.5 pt-1">
            <h5 className="text-lg font-medium px-4 pb-2">Items Management</h5>
            <div className="flex flex-col gap-1 border-b border-gray-200 px-4 my-4 pb-4">
                <Label className="text-xs">Select Category</Label>
                <Select value={currentCategoryItems} onValueChange={onChangeCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categoryDataOptions?.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="p-4 pt-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleCategoriesDragEnd}
                >
                    {/* SortableContext manages the sortable items */}
                    <SortableContext
                        items={currentItems.map(item => item.unique_id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {/* Render each item as a sortable item */}
                        {currentItems.map((item) => (
                            <SortableCategoryItem
                                key={item.unique_id}
                                item={item}
                                onToggleVisibility={handleToggleVisibility}
                            />
                        ))}
                    </SortableContext>
                    {/* Overlay to show while dragging */}
                    <DragOverlay>
                        {activeDragItem && activeDragItem?.type === 'item' && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/80 border">
                                <GripVertical size={16} className="text-muted-foreground" />
                                <div className="flex-1 truncate">{activeDragItem?.item?.name}</div>
                                <Button variant="ghost" size="icon">
                                    {activeDragItem?.item?.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                </Button>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
