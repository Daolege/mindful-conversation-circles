
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
    
    // Ensure we're properly casting the data to TranslationHistoryItem[]
    if (Array.isArray(data)) {
      // Type guard to check if items match the expected structure
      const historyItems = data.filter((item): item is TranslationHistoryItem => 
        item !== null && 
        typeof item === 'object' &&
        'translation_id' in item &&
        'language_code' in item &&
        'namespace' in item &&
        'key' in item &&
        'new_value' in item
      ) as TranslationHistoryItem[];
      
      return { success: true, data: historyItems };
    }
    
    return { success: false, data: [], error: new Error('Invalid data format') };
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
    
    if (fetchError || !Array.isArray(data) || data.length === 0) {
      const error = fetchError || new Error('Version not found');
      console.error('Error fetching version:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    // Type guard to ensure data has the expected structure
    if (!('new_value' in data[0])) {
      return { success: false, error: new Error('Invalid data format') };
    }
    
    // Get the value from the fetched version
    const valueToRestore = data[0].new_value;
    
    // Get the current translation to update
    const { data: currentData, error: currentError } = await selectFromTable(
      'translations',
      'language_code, namespace, key',
      { id: translationId },
      { limit: 1 }
    );
    
    if (currentError || !Array.isArray(currentData) || currentData.length === 0) {
      const error = currentError || new Error('Translation not found');
      console.error('Error fetching current translation:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    // Type guard to ensure currentData has the expected structure
    if (!('language_code' in currentData[0]) || 
        !('namespace' in currentData[0]) || 
        !('key' in currentData[0])) {
      return { success: false, error: new Error('Invalid translation data format') };
    }
    
    const currentTranslation = currentData[0];
    
    // Update the translation with the historical value
    const updateResult = await batchUpdateTranslations([{
      id: translationId,
      language_code: currentTranslation.language_code,
      namespace: currentTranslation.namespace,
      key: currentTranslation.key,
      value: valueToRestore
    } as TranslationItem]);
    
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
