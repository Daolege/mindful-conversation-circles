
import { saveAs } from 'file-saver';
import { TranslationItem } from "@/lib/services/languageService";

/**
 * 将翻译导出为JSON文件
 */
export function exportTranslationsToJson(translations: TranslationItem[], languageCode: string): void {
  // 按命名空间组织翻译
  const organizedTranslations: Record<string, Record<string, string>> = {};
  
  translations.forEach(item => {
    if (!organizedTranslations[item.namespace]) {
      organizedTranslations[item.namespace] = {};
    }
    organizedTranslations[item.namespace][item.key] = item.value;
  });
  
  // 创建并下载JSON文件
  const blob = new Blob([JSON.stringify(organizedTranslations, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  
  saveAs(blob, `translations_${languageCode}.json`);
}

/**
 * 从JSON文件解析翻译
 */
export function parseTranslationsFromJson(
  jsonData: Record<string, Record<string, string>>,
  languageCode: string
): TranslationItem[] {
  const translations: TranslationItem[] = [];
  
  Object.entries(jsonData).forEach(([namespace, items]) => {
    Object.entries(items).forEach(([key, value]) => {
      translations.push({
        language_code: languageCode,
        namespace,
        key,
        value
      } as TranslationItem);
    });
  });
  
  return translations;
}

/**
 * 验证翻译JSON格式
 */
export function validateTranslationJson(json: unknown): boolean {
  if (!json || typeof json !== 'object') return false;
  
  // 检查顶层键是否为命名空间，值是否为对象
  for (const [key, value] of Object.entries(json as object)) {
    if (!value || typeof value !== 'object') return false;
    
    // 检查命名空间内的键值对
    for (const [innerKey, innerValue] of Object.entries(value as object)) {
      if (typeof innerValue !== 'string') return false;
    }
  }
  
  return true;
}

/**
 * 从JSON文件中导入翻译
 */
export async function importTranslationsFromFile(file: File, languageCode: string): Promise<{
  success: boolean;
  translations?: TranslationItem[];
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          resolve({ success: false, error: 'Invalid file format' });
          return;
        }
        
        const jsonData = JSON.parse(result);
        
        if (!validateTranslationJson(jsonData)) {
          resolve({ success: false, error: 'Invalid translation format' });
          return;
        }
        
        const translations = parseTranslationsFromJson(jsonData, languageCode);
        resolve({ success: true, translations });
      } catch (error) {
        resolve({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error parsing file' 
        });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Error reading file' });
    };
    
    reader.readAsText(file);
  });
}
