
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, AlertCircle } from "lucide-react";
import { LegalDocument, legalDocumentsService } from "@/lib/supabaseUtils";
import { defaultLegalDocuments } from "@/lib/defaultData";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentState {
  [key: string]: {
    title: string;
    content: string;
  }
}

const LegalDocumentsManagement = () => {
  const { t } = useTranslations();
  const [activeDocument, setActiveDocument] = useState("privacy-policy");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);

  // Document content state
  const [documents, setDocuments] = useState<DocumentState>({
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
      // Using our new service
      const legalDocs = await legalDocumentsService.getAll();
      
      if (legalDocs && legalDocs.length > 0) {
        const newDocuments = { ...documents };
        legalDocs.forEach((doc: LegalDocument) => {
          if (newDocuments[doc.slug]) {
            newDocuments[doc.slug] = {
              title: doc.title,
              content: doc.content
            };
          }
        });
        setDocuments(newDocuments);
        setIsUsingSampleData(false);
      } else {
        // Use sample data if no documents found
        loadSampleDocuments();
      }
    } catch (error) {
      console.error("Error loading legal documents:", error);
      toast.error("加载法律文档失败，使用示例数据");
      
      // Use sample data on error
      loadSampleDocuments();
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample documents
  const loadSampleDocuments = () => {
    const newDocuments = { ...documents };
    Object.keys(defaultLegalDocuments).forEach(slug => {
      const doc = defaultLegalDocuments[slug];
      if (newDocuments[slug]) {
        newDocuments[slug] = {
          title: doc.title,
          content: doc.content
        };
      }
    });
    setDocuments(newDocuments);
    setIsUsingSampleData(true);
  };

  // Function to save current document
  const saveDocument = async () => {
    setIsSaving(true);
    try {
      const { title, content } = documents[activeDocument];
      
      // Try to save to database
      try {
        // Using our new service
        const { error } = await legalDocumentsService.upsert({
          slug: activeDocument,
          title: title,
          content: content,
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          throw error;
        }
        
        setIsUsingSampleData(false);
      } catch (error) {
        console.error("Error saving document to database:", error);
        // Continue without error notification since we'll store in session
      }
      
      toast.success("文档已保存");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("保存文档失败");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to sample data
  const resetToSampleData = () => {
    loadSampleDocuments();
    toast.success("已重置为示例数据");
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      {isUsingSampleData && (
        <Alert className="bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            当前使用示例数据。您的更改可能不会永久保存到数据库，但会在当前会话中显示。
            <Button variant="link" className="p-0 h-auto text-amber-600" onClick={resetToSampleData}>
              重置为默认示例数据
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
