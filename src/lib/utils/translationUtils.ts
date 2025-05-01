
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
      });
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
