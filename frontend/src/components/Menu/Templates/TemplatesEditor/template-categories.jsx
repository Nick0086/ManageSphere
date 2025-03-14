import { Button } from '@/components/ui/button'
import { 
  closestCenter, 
  DndContext, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import { 
  arrayMove, 
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Eye, EyeOff, GripVertical, Pencil } from 'lucide-react'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { CSS } from '@dnd-kit/utilities'
import SlackLoader from '@/components/ui/CustomLoaders/SlackLoader'
import { useTemplate } from '@/contexts/TemplateContext'

/**
 * Sortable item component representing a single category
 * Uses dnd-kit's useSortable hook to enable drag-and-drop functionality
 */
function SortableCategoryItem({ category, onToggleVisibility, onEdit }) {
  // Get sortable properties and methods from dnd-kit
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({
    id: category.unique_id,
    data: { type: "category", category },
  })

  // Apply transform styles for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center bg-white gap-1 px-2 py-1 rounded-md ${
        isDragging ? "bg-muted/80" : "hover:bg-muted/50"
      } border mb-2`}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-muted-foreground" />
      </div>
      
      {/* Category name */}
      <div className="flex-1 truncate text-sm">{category.name}</div>
      
      {/* Visibility toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleVisibility(category.unique_id)}
        title={category.visible ? "Hide Category" : "Show Category"}
      >
        {category.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </Button>
      
      {/* Edit button */}
      <Button 
        variant="ghost" 
        size="icon" 
        title="Edit Category" 
        onClick={() => onEdit(category.unique_id)}
      >
        <Pencil size={12} />
      </Button>
    </div>
  )
}

/**
 * Main component for managing categories with drag-and-drop functionality
 * Allows reordering, toggling visibility, and editing of categories
 */
export default function TemplateCategories({
  isCategoryLoading,
  templateConfig,
  setTemplateConfig,
  handleTabChang
}) {
  const {setCurrentSection} = useTemplate()
  // Extract categories from template config with fallback to empty array
  const initialCategories = templateConfig?.categories || [];
  
  // State for managing the categories and currently dragged item
  const [categories, setCategories] = useState(initialCategories);
  const [activeDragItem, setActiveDragItem] = useState(null);

  // Configure drag sensors with sensitivity settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require minimum drag distance to prevent accidental drags
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Memoize category IDs to prevent unnecessary re-renders in SortableContext
  const categoryIds = useMemo(() => 
    categories.map((c) => c.unique_id), 
    [categories]
  );

  // Handler for when drag starts - store the dragged item data
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveDragItem(active.data.current);
  }, []);

  // Toggle visibility handler - memoized to prevent recreation on each render
  const handleToggleVisibility = useCallback((uniqueId) => {
    setCategories((prev) => 
      prev.map((cat) => 
        cat.unique_id === uniqueId 
          ? { ...cat, visible: !cat.visible } 
          : cat
      )
    );
  }, []);

  // Edit category handler - memoized to prevent recreation on each render
  const handleEditCategory = useCallback((uniqueId) => {
    // Implement your edit logic here
    setCurrentSection(uniqueId)
    handleTabChang('Styling');
  }, []);

  // Handle the end of a drag operation
  const handleCategoriesDragEnd = useCallback((event) => {
    const { active, over } = event;
    

    // Skip if not dropped on a valid target
    if (!over) return;

    // Reorder categories if dropped on a different category
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.unique_id === active.id);
        const newIndex = items.findIndex((item) => item.unique_id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    // Reset active drag item
    setActiveDragItem(null);
  }, []);

  // Update parent template config when categories change
  useEffect(() => {
    setTemplateConfig((prev) => ({
      ...prev,
      categories: categories
    }));
  }, [categories, setTemplateConfig]);

  // Loading state
  if (isCategoryLoading) {
    return <div className="p-4 h-96 flex items-center justify-center "><SlackLoader/></div>;
  }

  // Empty state
  if (!categories.length) {
    return <div className="p-4">No categories available.</div>;
  }

  return (
    <div className="space-y-1.5 p-4 pt-1">
      <h5 className="text-lg font-medium">Category Management</h5>
      
      {/* DndContext provides the drag-and-drop functionality */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleCategoriesDragEnd}
      >
        {/* SortableContext manages the sortable items */}
        <SortableContext 
          items={categoryIds} 
          strategy={verticalListSortingStrategy}
        >
          {/* Render each category as a sortable item */}
          {categories.map((category) => (
            <SortableCategoryItem
              key={category.unique_id}
              category={category}
              onToggleVisibility={handleToggleVisibility}
              onEdit={handleEditCategory}
            />
          ))}
        </SortableContext>

        {/* Overlay to show while dragging */}
        <DragOverlay>
          {activeDragItem && activeDragItem?.type === "category" && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/80 border">
              <GripVertical size={16} className="text-muted-foreground" />
              <div className="flex-1 truncate">{activeDragItem?.category?.name}</div>
              <Button variant="ghost" size="icon">
                {activeDragItem?.category?.visible ? <Eye size={12}/> : <EyeOff size={12} />}
              </Button>
              <Button variant="ghost" size="icon">
                <Pencil size={12} />
              </Button>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}