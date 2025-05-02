
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Loader2, HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { getFeaturedFaqsByLanguage } from "@/lib/services/faqService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EXPAND_DURATION = 300;

const HomeFAQSection = () => {
  const [openFaqIds, setOpenFaqIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const { currentLanguage, t } = useTranslations();

  const {
    data: faqs = [],
    isLoading,
  } = useQuery({
    queryKey: ["featured-faqs", currentLanguage],
    queryFn: async () => {
      const { data, error } = await getFeaturedFaqsByLanguage(currentLanguage, 6);
      
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

  const filteredFaqs = faqs.filter(faq => 
    !searchTerm || 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-16 bg-gray-50 border-t border-b">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">{t('common:commonQuestions')}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{t('common:platformQuestionsExplanation')}</p>
          
          {/* Search input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              type="text"
              placeholder={t('common:searchQuestions')}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredFaqs.map((faq) => {
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
                      <CardTitle className="flex-1 text-base font-medium text-left text-gray-900">
                        {faq.question}
                      </CardTitle>
                      <span className="ml-2 transition-transform duration-300">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </span>
                    </CardHeader>
                    <CollapsibleContent
                      className="overflow-hidden transition-all"
                      style={{
                        transitionDuration: `${EXPAND_DURATION}ms`,
                      }}
                    >
                      <CardContent className="text-gray-600 whitespace-pre-wrap pt-0 pb-4 px-4">
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
        
        {/* View all FAQs button */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="mx-auto">
            <Link to="/faq">
              {t('common:viewAllFAQs')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQSection;
