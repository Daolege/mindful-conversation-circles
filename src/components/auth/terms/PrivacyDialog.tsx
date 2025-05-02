
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  const { currentLanguage } = useLanguage();
  const isEnglish = currentLanguage === 'en';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{isEnglish ? "Privacy Policy" : "隐私政策"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-8">
            {/* Show content based on current language */}
            {isEnglish ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Privacy Policy</h2>
                <div className="space-y-2 text-sm">
                  <p>Last Updated: April 21, 2025</p>
                  
                  <h3 className="font-semibold mt-4">1. Information Collection</h3>
                  <p>We collect personal information that you voluntarily provide when registering on our platform, including but not limited to your name, email address, and contact information.</p>
                  
                  <h3 className="font-semibold mt-4">2. Use of Information</h3>
                  <p>We use the collected information to provide and improve our services, communicate with you, and comply with legal obligations. We do not sell or rent your personal information to third parties.</p>
                  
                  <h3 className="font-semibold mt-4">3. Data Security</h3>
                  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                  
                  <h3 className="font-semibold mt-4">4. Cookies</h3>
                  <p>We use cookies and similar tracking technologies to enhance your browsing experience. You can choose to disable cookies through your browser settings.</p>
                  
                  <h3 className="font-semibold mt-4">5. Rights of Users</h3>
                  <p>Under the Hong Kong Personal Data (Privacy) Ordinance, you have the right to access, correct, and delete your personal information.</p>
                  
                  <h3 className="font-semibold mt-4">6. Changes to Privacy Policy</h3>
                  <p>We reserve the right to update this privacy policy at any time. Changes will be effective immediately upon posting on this platform.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">隐私政策</h2>
                <div className="space-y-2 text-sm">
                  <p>最后更新日期：2025年4月21日</p>
                  
                  <h3 className="font-semibold mt-4">1. 资料收集</h3>
                  <p>我们收集您在平台注册时自愿提供的个人资料，包括但不限于您的姓名、电邮地址和联络资料。</p>
                  
                  <h3 className="font-semibold mt-4">2. 资料使用</h3>
                  <p>我们使用收集的资料来提供和改进我们的服务、与您沟通并遵守法律义务。我们不会向第三方出售或出租您的个人资料。</p>
                  
                  <h3 className="font-semibold mt-4">3. 资料安全</h3>
                  <p>我们实施适当的安全措施，以保护您的个人资料免受未经授权的存取、更改、披露或销毁。</p>
                  
                  <h3 className="font-semibold mt-4">4. Cookies</h3>
                  <p>我们使用cookies和类似的追踪技术来增强您的浏览体验。您可以通过浏览器设置选择禁用cookies。</p>
                  
                  <h3 className="font-semibold mt-4">5. 用户权利</h3>
                  <p>根据香港《个人资料（隐私）条例》，您有权存取、更正和删除您的个人资料。</p>
                  
                  <h3 className="font-semibold mt-4">6. 隐私政策变更</h3>
                  <p>我们保留随时更新本隐私政策的权利。变更将在本平台发布后立即生效。</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
