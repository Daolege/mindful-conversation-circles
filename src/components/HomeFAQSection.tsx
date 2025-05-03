
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Loader2, HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { getFaqsByLanguage, FaqWithTranslation } from "@/lib/services/faqService";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EXPAND_DURATION = 300;

const HomeFAQSection = () => {
  const [openFaqIds, setOpenFaqIds] = useState(new Set<number>());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { currentLanguage, t } = useTranslations();

  const {
    data: faqs = [],
    isLoading,
  } = useQuery({
    queryKey: ["faqs", currentLanguage],
    queryFn: async () => {
      const { data, error } = await getFaqsByLanguage(currentLanguage);
      
      if (error) {
        console.error("Error fetching FAQs:", error);
        return [] as FaqWithTranslation[];
      }

      return (data || []) as FaqWithTranslation[];
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

  // Filter FAQs based on search term and active tab
  const filteredFaqs = Array.isArray(faqs) ? faqs.filter((faq: FaqWithTranslation) => {
    const matchesSearch =
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeTab === "all" || faq.category === activeTab;

    return matchesSearch && matchesCategory;
  }) : [];

  // Group FAQs by category for display
  const getCategoryTitle = (category: string): string => {
    switch (category) {
      case "account":
        return t('common:accountIssues');
      case "course":
        return t('common:courseRelated');
      case "payment":
        return t('common:paymentIssues');
      default:
        return t('common:otherQuestions');
    }
  };

  // FAQ Card component to reduce repetition
  const FAQCard = ({ faq }: { faq: FaqWithTranslation }) => (
    <Collapsible key={faq.id} open={openFaqIds.has(faq.id)}>
      <Card
        className={`
          cursor-pointer 
          transition-all duration-300 ease-in-out
          hover:bg-[#F8F8F8]
          ${openFaqIds.has(faq.id) ? 
            'shadow-md border-[#E5E5E5]' : 
            'hover:shadow-sm hover:-translate-y-[1px]'
          }
        `}
        onClick={() => handleCardToggle(faq.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="flex-1 text-base font-medium text-left text-[#404040]">
            {faq.question}
          </CardTitle>
          <span className="ml-2 transition-transform duration-300">
            {openFaqIds.has(faq.id) ? (
              <ChevronUp className="w-5 h-5 text-[#808080]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#808080]" />
            )}
          </span>
        </CardHeader>
        <CollapsibleContent
          className="overflow-hidden transition-all"
          style={{
            transitionDuration: `${EXPAND_DURATION}ms`,
          }}
        >
          <CardContent className="text-[#808080] whitespace-pre-wrap pt-0 pb-4 px-4">
            {faq.answer}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <section className="py-16 bg-white border-t border-b border-[#E5E5E5]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2 text-[#262626]">{t('common:commonQuestions')}</h2>
          <p className="text-[#808080] max-w-2xl mx-auto">{t('common:platformQuestionsExplanation')}</p>
          
          {/* Search input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#808080]" size={18} />
            <Input 
              type="text"
              placeholder={t('common:searchQuestions')}
              className="pl-10 border-[#E5E5E5] text-[#404040]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Category tabs - Updated to match Dashboard style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-gray-50/90 p-3 border border-gray-200 rounded-2xl shadow-sm">
            <TabsTrigger 
              value="all" 
              className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#595959] data-[state=active]:text-white"
            >
              {t('common:allQuestions')}
            </TabsTrigger>
            <TabsTrigger 
              value="account"
              className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#595959] data-[state=active]:text-white"
            >
              {t('common:accountQuestions')}
            </TabsTrigger>
            <TabsTrigger 
              value="course"
              className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#595959] data-[state=active]:text-white"
            >
              {t('common:courseQuestions')}
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#595959] data-[state=active]:text-white"
            >
              {t('common:paymentQuestions')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#808080]" />
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="space-y-8">
            {activeTab === "all" ? (
              // Group by category
              ["account", "course", "payment", "other"].map((category) => {
                const categoryFaqs = filteredFaqs.filter((faq: FaqWithTranslation) => faq.category === category);
                if (categoryFaqs.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-4 text-[#404040]">{getCategoryTitle(category)}</h3>
                    <div className="space-y-4">
                      {categoryFaqs.map((faq: FaqWithTranslation) => (
                        <FAQCard key={faq.id} faq={faq} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Filter by current category
              <div className="space-y-4">
                {filteredFaqs.map((faq: FaqWithTranslation) => (
                  <FAQCard key={faq.id} faq={faq} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="mx-auto h-8 w-8 text-[#808080] mb-3" />
            <div className="text-[#808080]">{t('common:noMatchingQuestions')}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFAQSection;
