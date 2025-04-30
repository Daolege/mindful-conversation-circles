
import { useCallback, useState } from 'react';

interface DraggableItem {
  id: string;
  position: number;
  [key: string]: any;
}

interface UseDraggableSortResult<T extends DraggableItem> {
  items: T[];
  onDragEnd: (result: { source: { index: number }; destination?: { index: number } }) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
}

/**
 * A hook to manage draggable sorting of items
 */
export function useDraggableSort<T extends DraggableItem>(
  initialItems: T[],
  onReorder?: (reorderedItems: T[]) => void
): UseDraggableSortResult<T> {
  const [items, setItems] = useState<T[]>(
    [...initialItems].sort((a, b) => a.position - b.position)
  );

  const reorderItems = useCallback((startIndex: number, endIndex: number) => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update positions
    const reordered = result.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setItems(reordered);
    if (onReorder) {
      onReorder(reordered);
    }
    
    return reordered;
  }, [items, onReorder]);

  const onDragEnd = useCallback((result: { source: { index: number }; destination?: { index: number } }) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Didn't move
    if (result.source.index === result.destination.index) {
      return;
    }

    reorderItems(result.source.index, result.destination.index);
  }, [reorderItems]);

  return { items, onDragEnd, reorderItems };
}
