
import { supabase } from "@/integrations/supabase/client";
import { 
  selectFromTable, 
  callRpcFunction 
} from "@/lib/services/typeSafeSupabase";

// FAQ types
export interface MultiFaq {
  id: number;
  category: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FaqTranslation {
  id: number;
  faq_id: number;
  language_code: string;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}

export interface FaqWithTranslation extends MultiFaq {
  question: string;
  answer: string;
  language_code: string;
}

// Get FAQs by language code
export async function getFaqsByLanguage(languageCode: string) {
  try {
    const { data, error } = await callRpcFunction<FaqWithTranslation[]>(
      'get_faqs_by_language',
      { lang_code: languageCode }
    );
    
    if (error) {
      console.error('[faqService] Error getting FAQs by language:', error);
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in getFaqsByLanguage:', err);
    return { data: [], error: err as Error };
  }
}

// Get featured FAQs by language code with limit
export async function getFeaturedFaqsByLanguage(languageCode: string, limit: number = 8) {
  try {
    const { data, error } = await callRpcFunction<FaqWithTranslation[]>(
      'get_featured_faqs_by_language',
      { 
        lang_code: languageCode,
        limit_count: limit
      }
    );
    
    if (error) {
      console.error('[faqService] Error getting featured FAQs:', error);
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in getFeaturedFaqsByLanguage:', err);
    return { data: [], error: err as Error };
  }
}

// Create a new FAQ
export async function createFaq(faq: Omit<MultiFaq, 'id'>) {
  try {
    const { data, error } = await selectFromTable<MultiFaq>(
      'multilingual_faqs',
      '*',
      {}
    );
    
    if (error) {
      console.error('[faqService] Error creating FAQ:', error);
      return { data: null, error };
    }
    
    return { data: data && data[0], error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in createFaq:', err);
    return { data: null, error: err as Error };
  }
}

// Add or update FAQ translation
export async function upsertFaqTranslation(
  faqId: number,
  languageCode: string,
  question: string,
  answer: string
) {
  try {
    const { error } = await callRpcFunction(
      'upsert_faq_translation',
      { 
        p_faq_id: faqId,
        p_language_code: languageCode,
        p_question: question,
        p_answer: answer
      }
    );
    
    if (error) {
      console.error('[faqService] Error upserting FAQ translation:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in upsertFaqTranslation:', err);
    return { success: false, error: err as Error };
  }
}

// Get FAQ translation by FAQ ID and language code
export async function getFaqTranslation(faqId: number, languageCode: string) {
  try {
    const { data, error } = await selectFromTable<FaqTranslation>(
      'faq_translations',
      '*',
      { 
        faq_id: faqId,
        language_code: languageCode
      }
    );
    
    if (error) {
      console.error('[faqService] Error getting FAQ translation:', error);
      return { data: null, error };
    }
    
    return { data: data && data[0], error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in getFaqTranslation:', err);
    return { data: null, error: err as Error };
  }
}

// Get all translations for a FAQ
export async function getAllFaqTranslations(faqId: number) {
  try {
    const { data, error } = await selectFromTable<FaqTranslation>(
      'faq_translations',
      '*',
      { faq_id: faqId }
    );
    
    if (error) {
      console.error('[faqService] Error getting all FAQ translations:', error);
      return { data: [], error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[faqService] Unexpected error in getAllFaqTranslations:', err);
    return { data: [], error: err as Error };
  }
}
