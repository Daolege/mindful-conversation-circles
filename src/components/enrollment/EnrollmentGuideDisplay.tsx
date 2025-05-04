
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnrollmentGuide } from '@/lib/services/enrollmentGuideService';
import { Wechat, QrCode, Whatsapp, ExternalLink } from 'lucide-react';

interface EnrollmentGuideDisplayProps {
  guides: EnrollmentGuide[];
}

export const EnrollmentGuideDisplay: React.FC<EnrollmentGuideDisplayProps> = ({ guides }) => {
  const wechatGuides = guides.filter(g => g.guide_type === 'wechat_qrcode').sort((a, b) => a.position - b.position);
  const whatsappGuides = guides.filter(g => g.guide_type === 'whatsapp_contact').sort((a, b) => a.position - b.position);
  
  if (guides.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          课程社群
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* WeChat QR Codes */}
          {wechatGuides.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wechat className="h-5 w-5 text-green-600" />
                微信群二维码
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wechatGuides.map((guide) => (
                  <div key={guide.id} className="flex flex-col items-center md:flex-row md:items-start gap-4 p-4 border rounded-lg bg-gray-50">
                    {guide.image_url ? (
                      <img 
                        src={guide.image_url} 
                        alt={guide.title} 
                        className="w-32 h-32 object-contain border bg-white p-1 rounded-md"
                      />
                    ) : (
                      <div className="w-32 h-32 border rounded-md bg-gray-100 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-medium">{guide.title}</h4>
                      {guide.content && (
                        <p className="text-sm text-gray-600 mt-1">{guide.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* WhatsApp Contacts */}
          {whatsappGuides.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Whatsapp className="h-5 w-5 text-green-600" />
                WhatsApp联系方式
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whatsappGuides.map((guide) => (
                  <div key={guide.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium">{guide.title}</h4>
                      {guide.content && (
                        <p className="text-sm text-gray-600 mt-1">{guide.content}</p>
                      )}
                    </div>
                    
                    {guide.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={guide.link} target="_blank" rel="noopener noreferrer">
                          <Whatsapp className="mr-2 h-4 w-4" />
                          <span>联系</span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
