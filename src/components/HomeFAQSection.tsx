
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Loader2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { getFeaturedFaqsByLanguage } from "@/lib/services/faqService";

const EXPAND_DURATION = 400;

const HomeFAQSection = () => {
  const [openFaqIds, setOpenFaqIds] = useState<Set<number>>(new Set());
  const { currentLanguage, t } = useTranslations();

  const {
    data: faqs = [],
    isLoading,
  } = useQuery({
    queryKey: ["featured-faqs", currentLanguage],
    queryFn: async () => {
      const { data, error } = await getFeaturedFaqsByLanguage(currentLanguage, 8);
      
      if (error) {
        console.error("Error fetching featured FAQs:", error);
        return [];
      }

      return data || [];
    },
  });

  function handleCardToggle(id: number) {
    setOpenFaqIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section className="py-12 bg-gray-50 border-t border-b">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('common:commonQuestions')}</h2>
          <p className="text-gray-500">{t('common:platformQuestionsExplanation')}</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : faqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              
              return (
                <Collapsible key={faq.id} open={isOpen}>
                  <Card
                    className={`
                      cursor-pointer 
                      transition-all duration-300 ease-in-out
                      hover:bg-gray-50/80
                      ${isOpen ? 
                        'shadow-md border-gray-300' : 
                        'hover:shadow-sm hover:-translate-y-[1px]'
                      }
                    `}
                    onClick={() => handleCardToggle(faq.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                      <CardTitle className="flex-1 text-sm font-medium text-left text-gray-900 line-clamp-2">
                        {faq.question}
                      </CardTitle>
                      <span className="ml-2 transition-transform duration-300">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    </CardHeader>
                    <CollapsibleContent
                      className="overflow-hidden transition-all"
                      style={{
                        transitionDuration: `${EXPAND_DURATION}ms`,
                      }}
                    >
                      <CardContent className="text-sm text-gray-600 whitespace-pre-wrap pt-0 pb-4 px-4">
                        {faq.answer}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <div className="text-gray-500">{t('common:noQuestionsAvailable')}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFAQSection;
