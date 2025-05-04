import React, { useState, useEffect } from 'react';
import { EnrollmentGuide, getEnrollmentGuides, createEnrollmentGuide, updateEnrollmentGuide, deleteEnrollmentGuide, uploadQRCodeImage } from '@/lib/services/enrollmentGuideService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Loader2, Plus, QrCode, Trash2, Upload, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnrollmentGuidesEditorProps {
  courseId: number;
}

export const EnrollmentGuidesEditor: React.FC<EnrollmentGuidesEditorProps> = ({ courseId }) => {
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('wechat');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, [courseId]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await getEnrollmentGuides(courseId);
      setGuides(data);
    } catch (error) {
      console.error("Failed to fetch guides:", error);
      toast.error("加载报名后引导数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeChatGuide = async () => {
    // Get current max position for WeChat guides
    const wechatGuides = guides.filter(g => g.guide_type === 'wechat_qrcode');
    const nextPosition = wechatGuides.length > 0 
      ? Math.max(...wechatGuides.map(g => g.position)) + 1 
      : 0;
    
    const newGuide: EnrollmentGuide = {
      course_id: courseId,
      guide_type: 'wechat_qrcode',
      title: `微信群 ${wechatGuides.length + 1}`,
      content: '',
      position: nextPosition
    };
    
    setSaving(true);
    try {
      const { success, data } = await createEnrollmentGuide(newGuide);
      if (success && data) {
        setGuides([...guides, data]);
        toast.success("添加微信群引导成功");
      }
    } catch (error) {
      toast.error("添加微信群引导失败");
    } finally {
      setSaving(false);
    }
  };

  const handleAddWhatsAppGuide = async () => {
    // Get current max position for WhatsApp guides
    const whatsappGuides = guides.filter(g => g.guide_type === 'whatsapp_contact');
    const nextPosition = whatsappGuides.length > 0 
      ? Math.max(...whatsappGuides.map(g => g.position)) + 1 
      : 0;
    
    const newGuide: EnrollmentGuide = {
      course_id: courseId,
      guide_type: 'whatsapp_contact',
      title: `WhatsApp 联系人 ${whatsappGuides.length + 1}`,
      content: '',
      link: '',
      position: nextPosition
    };
    
    setSaving(true);
    try {
      const { success, data } = await createEnrollmentGuide(newGuide);
      if (success && data) {
        setGuides([...guides, data]);
        toast.success("添加WhatsApp联系人成功");
      }
    } catch (error) {
      toast.error("添加WhatsApp联系人失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!guideId) return;
    
    if (!window.confirm("确定要删除这条引导信息吗？")) {
      return;
    }
    
    setSaving(true);
    try {
      const { success } = await deleteEnrollmentGuide(guideId);
      if (success) {
        setGuides(guides.filter(g => g.id !== guideId));
        toast.success("删除成功");
      }
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGuide = async (updatedGuide: EnrollmentGuide) => {
    if (!updatedGuide.id) return;
    
    setSaving(true);
    try {
      const { success } = await updateEnrollmentGuide(updatedGuide);
      if (success) {
        setGuides(guides.map(g => g.id === updatedGuide.id ? updatedGuide : g));
        toast.success("更新成功");
      }
    } catch (error) {
      toast.error("更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQRCode = async (guideId: string, file: File) => {
    if (!file || !guideId) return;
    
    setUploading(guideId);
    try {
      const { success, url, error } = await uploadQRCodeImage(courseId, file);
      if (success && url) {
        // Find the guide and update its image URL
        const guide = guides.find(g => g.id === guideId);
        if (guide) {
          const updatedGuide = { ...guide, image_url: url };
          await updateEnrollmentGuide(updatedGuide);
          setGuides(guides.map(g => g.id === guideId ? updatedGuide : g));
          toast.success("二维码上传成功");
        }
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("二维码上传失败");
    } finally {
      setUploading(null);
    }
  };

  const moveGuide = (guideId: string, direction: 'up' | 'down') => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;
    
    const sameTypeGuides = guides.filter(g => g.guide_type === guide.guide_type);
    const currentIndex = sameTypeGuides.findIndex(g => g.id === guideId);
    
    if (direction === 'up' && currentIndex <= 0) return;
    if (direction === 'down' && currentIndex >= sameTypeGuides.length - 1) return;
    
    const newGuides = [...guides];
    const sameTypeIndices = newGuides.map((g, i) => g.guide_type === guide.guide_type ? i : -1).filter(i => i !== -1);
    
    if (direction === 'up') {
      const targetIndex = sameTypeIndices[currentIndex - 1];
      const temp = { ...newGuides[targetIndex], position: guide.position };
      newGuides[sameTypeIndices[currentIndex]] = { ...newGuides[sameTypeIndices[currentIndex]], position: newGuides[targetIndex].position };
      newGuides[targetIndex] = temp;
    } else {
      const targetIndex = sameTypeIndices[currentIndex + 1];
      const temp = { ...newGuides[targetIndex], position: guide.position };
      newGuides[sameTypeIndices[currentIndex]] = { ...newGuides[sameTypeIndices[currentIndex]], position: newGuides[targetIndex].position };
      newGuides[targetIndex] = temp;
    }
    
    setGuides(newGuides);
  };

  const filteredWeChatGuides = guides.filter(g => g.guide_type === 'wechat_qrcode').sort((a, b) => a.position - b.position);
  const filteredWhatsAppGuides = guides.filter(g => g.guide_type === 'whatsapp_contact').sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">加载报名后引导数据...</p>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>报名后引导设置</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription>
            这里设置的信息将在学员支付成功后的页面展示，可���帮助学员加入课程相关的社群。
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="wechat" className="flex items-center gap-2">
              <MessageCircleIcon className="h-4 w-4" />
              微信群二维码
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              WhatsApp联系方式
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wechat" className="space-y-6">
            {filteredWeChatGuides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>您还没有添加任何微信群二维码</p>
              </div>
            ) : (
              filteredWeChatGuides.map((guide) => (
                <Card key={guide.id} className="border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`title-${guide.id}`}>标题</Label>
                            <Input
                              id={`title-${guide.id}`}
                              value={guide.title}
                              onChange={(e) => {
                                const updated = { ...guide, title: e.target.value };
                                setGuides(guides.map(g => g.id === guide.id ? updated : g));
                              }}
                              onBlur={() => handleUpdateGuide(guide)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`content-${guide.id}`}>描述</Label>
                            <Textarea
                              id={`content-${guide.id}`}
                              value={guide.content || ''}
                              onChange={(e) => {
                                const updated = { ...guide, content: e.target.value };
                                setGuides(guides.map(g => g.id === guide.id ? updated : g));
                              }}
                              onBlur={() => handleUpdateGuide(guide)}
                              rows={3}
                              placeholder="请描述如何使用这个二维码或者提供其他帮助信息"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {guide.image_url ? (
                          <div className="relative w-32 h-32">
                            <img 
                              src={guide.image_url} 
                              alt="二维码" 
                              className="w-full h-full object-contain border p-1 rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => {
                                document.getElementById(`qrcode-${guide.id}`)?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              更换
                            </Button>
                          </div>
                        ) : (
                          <div className="border rounded-md w-32 h-32 flex items-center justify-center bg-gray-50">
                            <Button
                              variant="outline"
                              onClick={() => {
                                document.getElementById(`qrcode-${guide.id}`)?.click();
                              }}
                              disabled={uploading === guide.id}
                            >
                              {uploading === guide.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              上传二维码
                            </Button>
                          </div>
                        )}
                        <input
                          type="file"
                          id={`qrcode-${guide.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadQRCode(guide.id!, e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveGuide(guide.id!, 'up')}
                          disabled={filteredWeChatGuides.indexOf(guide) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveGuide(guide.id!, 'down')}
                          disabled={filteredWeChatGuides.indexOf(guide) === filteredWeChatGuides.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGuide(guide.id!)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={handleAddWeChatGuide}
                disabled={saving}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加微信群二维码
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            {filteredWhatsAppGuides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PhoneIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>您还没有添加任何WhatsApp联系方式</p>
              </div>
            ) : (
              filteredWhatsAppGuides.map((guide) => (
                <Card key={guide.id} className="border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`title-${guide.id}`}>联系人名称</Label>
                        <Input
                          id={`title-${guide.id}`}
                          value={guide.title}
                          onChange={(e) => {
                            const updated = { ...guide, title: e.target.value };
                            setGuides(guides.map(g => g.id === guide.id ? updated : g));
                          }}
                          onBlur={() => handleUpdateGuide(guide)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`link-${guide.id}`}>WhatsApp链接</Label>
                        <Input
                          id={`link-${guide.id}`}
                          value={guide.link || ''}
                          onChange={(e) => {
                            const updated = { ...guide, link: e.target.value };
                            setGuides(guides.map(g => g.id === guide.id ? updated : g));
                          }}
                          onBlur={() => handleUpdateGuide(guide)}
                          placeholder="例如: https://wa.me/123456789"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`content-${guide.id}`}>描述</Label>
                        <Textarea
                          id={`content-${guide.id}`}
                          value={guide.content || ''}
                          onChange={(e) => {
                            const updated = { ...guide, content: e.target.value };
                            setGuides(guides.map(g => g.id === guide.id ? updated : g));
                          }}
                          onBlur={() => handleUpdateGuide(guide)}
                          rows={2}
                          placeholder="此联系人的作用或者其他帮助信息"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveGuide(guide.id!, 'up')}
                          disabled={filteredWhatsAppGuides.indexOf(guide) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveGuide(guide.id!, 'down')}
                          disabled={filteredWhatsAppGuides.indexOf(guide) === filteredWhatsAppGuides.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGuide(guide.id!)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={handleAddWhatsAppGuide}
                disabled={saving}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加WhatsApp联系方式
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
