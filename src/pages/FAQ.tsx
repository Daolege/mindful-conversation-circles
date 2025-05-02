
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { getFaqsByLanguage } from "@/lib/services/faqService";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openIds, setOpenIds] = useState(new Set());
  const { currentLanguage, t } = useTranslations();

  const {
    data: faqs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["multilingual-faqs", currentLanguage],
    queryFn: async () => {
      const { data, error } = await getFaqsByLanguage(currentLanguage);

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  // Filter FAQs based on search term and active tab
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeTab === "all" || faq.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category for display
  const getCategoryTitle = (category) => {
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

  function handleToggle(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (error) {
    console.error("Error loading FAQs:", error);
  }

  // FAQ Card component to reduce repetition
  const FAQCard = ({ faq }) => (
    <Collapsible key={faq.id} open={openIds.has(faq.id)}>
      <Card
        className={`cursor-pointer transition-all duration-300 group ${
          openIds.has(faq.id) ? "shadow-lg border-gray-300" : "hover:shadow-md"
        }`}
        onClick={() => handleToggle(faq.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="flex-1 text-base font-medium text-left">
            {faq.question}
          </CardTitle>
          <span className="ml-2 transition-transform duration-300">
            {openIds.has(faq.id) ? (
              <ChevronUp className="w-5 h-5 text-gray-500 transition-transform duration-300 animate-accordion-up" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-transform duration-300 animate-accordion-down" />
            )}
          </span>
        </CardHeader>
        <CollapsibleContent
          className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        >
          <CardContent className="text-gray-600 whitespace-pre-wrap pt-0 pb-4">
            {faq.answer}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">{t('common:faq')}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('common:faqDescription')}
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder={t('common:searchQuestions')}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Updated tabs to match Dashboard style */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-gray-50/90 p-3 border border-gray-200 rounded-2xl shadow-sm">
              <TabsTrigger 
                value="all" 
                className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#262626] data-[state=active]:text-white"
              >
                {t('common:allQuestions')}
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#262626] data-[state=active]:text-white"
              >
                {t('common:accountQuestions')}
              </TabsTrigger>
              <TabsTrigger 
                value="course"
                className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#262626] data-[state=active]:text-white"
              >
                {t('common:courseQuestions')}
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] data-[state=active]:bg-[#262626] data-[state=active]:text-white"
              >
                {t('common:paymentQuestions')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {activeTab === "all" ? (
                // Group by category
                ["account", "course", "payment", "other"].map((category) => {
                  const categoryFaqs = filteredFaqs.filter((faq) => faq.category === category);
                  if (categoryFaqs.length === 0) return null;

                  return (
                    <div key={category}>
                      <h2 className="text-xl font-semibold mb-4">{getCategoryTitle(category)}</h2>
                      <div className="space-y-4">
                        {categoryFaqs.map((faq) => (
                          <FAQCard key={faq.id} faq={faq} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Filter by current category
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <FAQCard key={faq.id} faq={faq} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">{t('common:noMatchingQuestions')}</h3>
              <p className="text-gray-500">
                {t('common:tryDifferentSearch')}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
