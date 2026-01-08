/**
 * Professional Sortable List Component (DEC-29)
 * 
 * Drag-and-drop ultra suave:
 * - DragOverlay para item flutuante
 * - CSS transitions puras (sem conflito com Framer Motion)
 * - Zero tremidas
 */

"use client";

import { useState, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";
import { FORM_THEME } from "./types";

interface SortableItemProps {
  id: string;
  index: number;
  children: ReactNode;
  isDragOverlay?: boolean;
  isActive?: boolean;
}

function SortableItem({ id, index, children, isDragOverlay, isActive }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 200,
      easing: "ease",
    },
  });

  // Overlay item (o que flutua enquanto arrasta)
  if (isDragOverlay) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{
          backgroundColor: FORM_THEME.background,
          boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 2px ${FORM_THEME.progressBar}`,
          transform: "scale(1.02)",
        }}
      >
        {/* Position Badge */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            backgroundColor: FORM_THEME.progressBar,
            color: FORM_THEME.buttonText,
          }}
        >
          {index + 1}
        </div>

        {/* Drag Handle */}
        <div style={{ color: FORM_THEME.progressBar }}>
          <GripVertical className="w-5 h-5" />
        </div>

        {children}
      </div>
    );
  }

  // Item normal na lista
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? "none" : "auto",
    touchAction: "none", // Evita conflito com scroll no mobile
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-xl mb-2 bg-white cursor-grab active:cursor-grabbing select-none touch-none"
      {...attributes}
      {...listeners}
    >
      {/* Position Badge - número fixo, sem animação */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          backgroundColor: FORM_THEME.progressBar,
          color: FORM_THEME.buttonText,
        }}
      >
        {index + 1}
      </div>

      {/* Drag Handle */}
      <div className="text-gray-400">
        <GripVertical className="w-5 h-5" />
      </div>

      {children}
    </div>
  );
}

interface SortableListProps<T> {
  items: T[];
  getItemId: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  onReorder: (newItems: T[]) => void;
}

export function SortableList<T>({
  items,
  getItemId,
  renderItem,
  onReorder,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId 
    ? items.find((item) => getItemId(item) === activeId) 
    : null;
  const activeIndex = activeId 
    ? items.findIndex((item) => getItemId(item) === activeId) 
    : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {items.map((item, index) => (
            <SortableItem
              key={getItemId(item)}
              id={getItemId(item)}
              index={index}
              isActive={getItemId(item) === activeId}
            >
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      {/* Drag Overlay - O item flutuante */}
      <DragOverlay
        adjustScale={false}
        dropAnimation={{
          duration: 200,
          easing: "ease",
        }}
      >
        {activeItem && activeIndex !== -1 ? (
          <SortableItem
            id={getItemId(activeItem)}
            index={activeIndex}
            isDragOverlay
          >
            {renderItem(activeItem, activeIndex)}
          </SortableItem>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
