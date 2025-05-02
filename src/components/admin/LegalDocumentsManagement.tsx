
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2 } from "lucide-react";

const LegalDocumentsManagement = () => {
  const { t } = useTranslations();
  const [activeDocument, setActiveDocument] = useState("privacy-policy");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Document content state
  const [documents, setDocuments] = useState({
    "privacy-policy": {
      title: "隐私政策",
      content: "",
    },
    "terms-of-use": {
      title: "使用条款",
      content: "",
    },
    "cookie-policy": {
      title: "Cookie政策",
      content: "",
    },
    "registration-agreement": {
      title: "注册协议",
      content: "",
    },
    "data-transfer-terms": {
      title: "跨境数据传输条款",
      content: "",
    }
  });

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Function to load documents from database
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const newDocuments = { ...documents };
        data.forEach(doc => {
          if (newDocuments[doc.slug]) {
            newDocuments[doc.slug] = {
              title: doc.title,
              content: doc.content
            };
          }
        });
        setDocuments(newDocuments);
      }
    } catch (error) {
      console.error("Error loading legal documents:", error);
      toast.error("加载法律文档失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save current document
  const saveDocument = async () => {
    setIsSaving(true);
    try {
      const { title, content } = documents[activeDocument];
      
      const { error } = await supabase
        .from('legal_documents')
        .upsert({
          slug: activeDocument,
          title: title,
          content: content,
          updated_at: new Date().toISOString()
        }, { onConflict: 'slug' });
      
      if (error) {
        throw error;
      }
      
      toast.success("文档已保存");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("保存文档失败");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle content change
  const handleContentChange = (e) => {
    const { value } = e.target;
    setDocuments(prev => ({
      ...prev,
      [activeDocument]: {
        ...prev[activeDocument],
        content: value
      }
    }));
  };

  // Handle title change
  const handleTitleChange = (e) => {
    const { value } = e.target;
    setDocuments(prev => ({
      ...prev,
      [activeDocument]: {
        ...prev[activeDocument],
        title: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('common:legalDocuments')}</h2>
      
      <Tabs value={activeDocument} onValueChange={setActiveDocument}>
        <TabsList className="mb-4 grid grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="privacy-policy">隐私政策</TabsTrigger>
          <TabsTrigger value="terms-of-use">使用条款</TabsTrigger>
          <TabsTrigger value="cookie-policy">Cookie政策</TabsTrigger>
          <TabsTrigger value="registration-agreement">注册协议</TabsTrigger>
          <TabsTrigger value="data-transfer-terms">跨境数据传输条款</TabsTrigger>
        </TabsList>
        
        {Object.keys(documents).map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  编辑{documents[key].title}
                  <Button 
                    size="sm" 
                    onClick={saveDocument}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '保存文档'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  修改{documents[key].title}内容，保存后将立即生效
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-title">文档标题</Label>
                  <Input
                    id="document-title"
                    value={documents[key].title}
                    onChange={handleTitleChange}
                    placeholder="输入文档标题"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-content">文档内容</Label>
                  <Textarea
                    id="document-content"
                    value={documents[key].content}
                    onChange={handleContentChange}
                    placeholder="输入文档内容，支持HTML格式"
                    rows={15}
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LegalDocumentsManagement;
