
import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { toast } from 'sonner';

interface AutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<any>;
  interval?: number;
  debounceMs?: number;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * A hook to provide autosaving functionality
 */
export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000, // Default 30 seconds interval
  debounceMs = 1000, // Default 1 second debounce
  successMessage = "已自动保存",
  errorMessage = "自动保存失败"
}: AutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const dataRef = useRef(data);

  // Update ref whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      if (!dataRef.current) return;
      
      try {
        setIsSaving(true);
        setError(null);
        await onSave(dataRef.current);
        setLastSaved(new Date());
        toast.success(successMessage);
      } catch (err: any) {
        console.error('[AutoSave] Error:', err);
        setError(err);
        toast.error(errorMessage, { description: err.message });
      } finally {
        setIsSaving(false);
      }
    }, debounceMs),
    [onSave, debounceMs, successMessage, errorMessage]
  );

  // Handle data changes
  useEffect(() => {
    debouncedSave();
  }, [data, debouncedSave]);

  // Set up interval for periodic saving
  useEffect(() => {
    if (interval <= 0) return;
    
    const timer = setInterval(() => {
      debouncedSave();
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, debouncedSave]);

  // Manually trigger save
  const saveNow = useCallback(async () => {
    debouncedSave.cancel();
    
    try {
      setIsSaving(true);
      setError(null);
      await onSave(dataRef.current);
      setLastSaved(new Date());
      toast.success(successMessage);
      return true;
    } catch (err: any) {
      console.error('[AutoSave] Error during manual save:', err);
      setError(err);
      toast.error(errorMessage, { description: err.message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSave, debouncedSave, successMessage, errorMessage]);

  return {
    lastSaved,
    isSaving,
    error,
    saveNow
  };
}
