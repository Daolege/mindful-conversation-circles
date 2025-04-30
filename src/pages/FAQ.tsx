
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
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

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  // 支持多选展开,用Set存id
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const {
    data: faqs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
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
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "account":
        return "账户问题";
      case "course":
        return "课程相关";
      case "payment":
        return "支付问题";
      default:
        return "其他问题";
    }
  };

  function handleToggle(id: string) {
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
  const FAQCard = ({ faq }: { faq: any }) => (
    <Collapsible key={faq.id} open={openIds.has(faq.id)}>
      <Card
        className={`cursor-pointer transition-all duration-300 group ${
          openIds.has(faq.id) ? "shadow-lg border-primary" : "hover:shadow-md"
        }`}
        onClick={() => handleToggle(faq.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="flex-1 text-base font-medium text-left">
            {faq.question}
          </CardTitle>
          <span className="ml-2 transition-transform duration-300">
            {openIds.has(faq.id) ? (
              <ChevronUp className="w-5 h-5 text-primary transition-transform duration-300 animate-accordion-up" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary transition-transform duration-300 animate-accordion-down" />
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
            <h1 className="text-3xl font-bold mb-4">常见问题解答</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              查找与我们的课程、账户和支付相关的常见问题的答案。如果您没有找到您要寻找的内容，请联系我们的客服团队。
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="搜索问题..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">全部问题</TabsTrigger>
              <TabsTrigger value="account">账户问题</TabsTrigger>
              <TabsTrigger value="course">课程相关</TabsTrigger>
              <TabsTrigger value="payment">支付问题</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {activeTab === "all" ? (
                // 分组，每组用卡片+collapsible，支持多选展开
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
                // 当前分类
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <FAQCard key={faq.id} faq={faq} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">没有找到相关问题</h3>
              <p className="text-gray-500">
                尝试不同的搜索词或浏览其他类别
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
