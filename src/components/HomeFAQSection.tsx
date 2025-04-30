
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Loader2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { handleFaqsQueryError } from "@/lib/supabaseUtils";

const CARD_ANIMATION_STAGGER = 100;
const EXPAND_DURATION = 800;

const HomeFAQSection = () => {
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const {
    data: faqs = [],
    isLoading,
  } = useQuery({
    queryKey: ["faqs", "home-top10"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      return handleFaqsQueryError(data, error);
    },
  });

  function handleCardToggle(id: string) {
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
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">常见问题</h2>
          <p className="text-gray-500">这里为你解答最常见的学习/平台问题</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : faqs.length > 0 ? (
          <div className="space-y-4 mb-6">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIds.has(faq.id);
              const delay = `${i * CARD_ANIMATION_STAGGER}ms`;
              
              return (
                <Collapsible key={faq.id} open={isOpen}>
                  <Card
                    className={`
                      cursor-pointer 
                      transition-all duration-700 ease-in-out
                      hover:bg-gray-50/80
                      group
                      ${isOpen ? 
                        'shadow-lg border-primary/60 ring-1 ring-primary/10' : 
                        'hover:shadow-md hover:-translate-y-[1px]'
                      }
                    `}
                    onClick={() => handleCardToggle(faq.id)}
                    style={{ transitionDelay: delay }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between p-6">
                      <CardTitle className="flex-1 text-base font-medium text-left text-gray-900">
                        {faq.question}
                      </CardTitle>
                      <span 
                        className={`
                          ml-2 
                          transition-transform duration-700 ease-in-out
                          ${isOpen ? 'rotate-180' : 'rotate-0'}
                        `}
                        style={{ transitionDelay: `${delay}` }}
                      >
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-primary/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </span>
                    </CardHeader>
                    <CollapsibleContent
                      className={`
                        overflow-hidden
                        transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)]
                        data-[state=open]:animate-in
                        data-[state=closed]:animate-out
                      `}
                      style={{
                        transitionDelay: delay,
                        transitionDuration: `${EXPAND_DURATION}ms`,
                        transitionProperty: "height, opacity, transform",
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <CardContent 
                        className={`
                          text-gray-700
                          whitespace-pre-wrap 
                          pt-0 pb-6 px-6
                          transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)]
                          data-[state=open]:translate-y-0 data-[state=open]:opacity-100
                          data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0
                        `}
                        style={{ transitionDelay: `${parseInt(delay) + 100}ms` }}
                      >
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
            <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <div className="text-gray-500">暂无常见问题</div>
          </div>
        )}

        <div className="text-center">
          <Link 
            to="/faq" 
            className="inline-block bg-knowledge-primary text-white px-6 py-2 rounded hover:bg-knowledge-primary/90 transition-colors duration-300"
          >
            查看全部常见问题
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQSection;
