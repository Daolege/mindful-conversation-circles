
import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';

export function useDraggableSort<T>(
  initialItems: T[],
  onItemsChange?: (items: T[]) => void
) {
  const [items, setItems] = useState<T[]>(initialItems);

  // Update items when initialItems changes
  useState(() => {
    if (initialItems !== items) {
      setItems(initialItems);
    }
  });

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create a new copy of items
    const newItems = Array.from(items);
    
    // Remove the item from its original position
    const [removed] = newItems.splice(source.index, 1);
    
    // Insert the item at the new position
    newItems.splice(destination.index, 0, removed);

    // Update positions based on new order
    const updatedItems = newItems.map((item, index) => {
      if (typeof item === 'object' && item !== null && 'position' in item) {
        return { ...item, position: index } as unknown as T;
      }
      return item;
    });

    // Update state
    setItems(updatedItems);
    
    // Call the callback if provided
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }
  }, [items, onItemsChange]);

  return { items, setItems, onDragEnd };
}
