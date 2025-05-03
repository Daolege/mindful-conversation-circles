
import { callRpcFunction, selectFromTable } from "@/lib/services/typeSafeSupabase";
import { TranslationItem } from "./languageCore";

/**
 * Update multiple translations at once
 * @param items Array of translation items to update
 * @returns Success status and count of updated items
 */
export async function batchUpdateTranslations(
  items: TranslationItem[]
): Promise<{ success: boolean; count: number; error?: Error }> {
  try {
    // Use batch inserts with replacements
    const { error } = await callRpcFunction(
      'upsert_translations_batch', 
      { translations_json: items }
    );
    
    if (error) {
      console.error('Error in batch update:', error);
      return { success: false, count: 0, error: error as unknown as Error };
    }
    
    return { success: true, count: items.length };
  } catch (error) {
    console.error('Unexpected error in batchUpdateTranslations:', error);
    return { success: false, count: 0, error: error as Error };
  }
}

/**
 * Get translation history for a specific translation
 * @param translationId ID of the translation
 * @returns Array of history entries
 */
export async function getTranslationHistory(
  translationId: number
): Promise<{
  success: boolean;
  data: TranslationHistoryItem[];
  error?: Error;
}> {
  try {
    const { data, error } = await selectFromTable(
      'translation_history',
      '*',
      { translation_id: translationId },
      { order: { column: 'version', ascending: false } }
    );
    
    if (error) {
      console.error('Error fetching translation history:', error);
      return { success: false, data: [], error: error as unknown as Error };
    }
    
    // Ensure we're properly handling the data
    if (!Array.isArray(data)) {
      return { success: false, data: [], error: new Error('Invalid data format: not an array') };
    }
    
    // Safely cast data to any[] first, then filter
    const safeData = data as any[];
    
    // Filter items that match our expected structure
    const historyItems = safeData.filter((item): item is TranslationHistoryItem => {
      return item !== null && 
        typeof item === 'object' &&
        'id' in item &&
        'translation_id' in item &&
        'language_code' in item &&
        'namespace' in item &&
        'key' in item &&
        'new_value' in item &&
        'version' in item;
    });
    
    return { success: true, data: historyItems };
  } catch (error) {
    console.error('Unexpected error in getTranslationHistory:', error);
    return { success: false, data: [], error: error as Error };
  }
}

/**
 * Rollback a translation to a specific version
 * @param translationId ID of the translation
 * @param version Version to rollback to
 * @returns Success status
 */
export async function rollbackToVersion(
  translationId: number,
  version: number
): Promise<{ success: boolean; error?: Error }> {
  try {
    // First get the version we want to restore
    const { data, error: fetchError } = await selectFromTable(
      'translation_history',
      'new_value',
      { translation_id: translationId, version },
      { limit: 1 }
    );
    
    if (fetchError) {
      console.error('Error fetching version:', fetchError);
      return { success: false, error: fetchError as unknown as Error };
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: new Error('Version not found') };
    }
    
    // Get the value to restore - we'll use a more direct approach with robust type checking
    const firstItem = data[0];
    
    // Explicit null check
    if (firstItem === null || firstItem === undefined) {
      return { success: false, error: new Error('Invalid data format: item is null') };
    }
    
    // Type check and property access in one go using a type guard
    if (typeof firstItem !== 'object' || !('new_value' in firstItem) || 
        typeof firstItem.new_value !== 'string') {
      return { success: false, error: new Error('Invalid data format: missing or invalid new_value') };
    }
    
    // Now we can safely access the new_value
    const valueToRestore = firstItem.new_value;
    
    // Get the current translation to update
    const { data: currentData, error: currentError } = await selectFromTable(
      'translations',
      'language_code, namespace, key',
      { id: translationId },
      { limit: 1 }
    );
    
    if (currentError) {
      console.error('Error fetching current translation:', currentError);
      return { success: false, error: currentError as unknown as Error };
    }
    
    if (!Array.isArray(currentData) || currentData.length === 0) {
      return { success: false, error: new Error('Translation not found') };
    }
    
    // Get the translation data with robust type checking
    const currentItem = currentData[0];
    
    // Explicit null check
    if (currentItem === null || currentItem === undefined) {
      return { success: false, error: new Error('Invalid translation data: item is null') };
    }
    
    // Type guard for required properties
    if (typeof currentItem !== 'object' || 
        !('language_code' in currentItem) || 
        !('namespace' in currentItem) || 
        !('key' in currentItem)) {
      return { success: false, error: new Error('Invalid translation data structure') };
    }
    
    // Type assertion with confidence - we've verified the structure
    const language_code = currentItem.language_code as string;
    const namespace = currentItem.namespace as string;
    const key = currentItem.key as string;
    
    // Create update item
    const updateItem: TranslationItem = {
      id: translationId,
      language_code,
      namespace,
      key,
      value: valueToRestore
    };
    
    const updateResult = await batchUpdateTranslations([updateItem]);
    
    return { 
      success: updateResult.success,
      error: updateResult.error
    };
  } catch (error) {
    console.error('Unexpected error in rollbackToVersion:', error);
    return { success: false, error: error as Error };
  }
}

// Define the structure of a translation history item
export interface TranslationHistoryItem {
  id: number;
  translation_id: number;
  language_code: string;
  namespace: string;
  key: string;
  old_value: string | null;
  new_value: string;
  changed_by: string | null;
  changed_at: string;
  version: number;
}
