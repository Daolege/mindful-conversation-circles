
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/contexts/LanguageContext';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  const { currentLanguage } = useLanguage();
  const isEnglish = currentLanguage === 'en';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{isEnglish ? "Terms of Service" : "服务条款"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-8">
            {isEnglish ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Terms of Service</h2>
                <div className="space-y-2 text-sm">
                  <p>Last Updated: April 21, 2025</p>
                  <h3 className="font-semibold mt-4">1. Acceptance of Terms</h3>
                  <p>By accessing and using this platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
                  
                  <h3 className="font-semibold mt-4">2. User Registration</h3>
                  <p>Users must provide accurate, current, and complete information during the registration process. Users are responsible for maintaining the confidentiality of their account credentials.</p>
                  
                  <h3 className="font-semibold mt-4">3. Intellectual Property</h3>
                  <p>All content, features, and functionality of this platform are owned by us and are protected by international copyright, trademark, and other intellectual property laws.</p>
                  
                  <h3 className="font-semibold mt-4">4. User Conduct</h3>
                  <p>Users agree not to engage in any activity that interferes with or disrupts the platform or violates any applicable laws or regulations.</p>
                  
                  <h3 className="font-semibold mt-4">5. Termination</h3>
                  <p>We reserve the right to terminate or suspend access to our platform immediately, without prior notice, for any breach of these Terms of Service.</p>
                  
                  <h3 className="font-semibold mt-4">6. Governing Law</h3>
                  <p>These terms shall be governed by and construed in accordance with the laws of Hong Kong Special Administrative Region.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">服务条款</h2>
                <div className="space-y-2 text-sm">
                  <p>最后更新日期：2025年4月21日</p>
                  
                  <h3 className="font-semibold mt-4">1. 条款接受</h3>
                  <p>透过访问和使用本平台，即表示您同意受这些服务条款以及所有适用法律法规的约束。如果您不同意任何这些条款，您将被禁止使用或访问本平台。</p>
                  
                  <h3 className="font-semibold mt-4">2. 用户注册</h3>
                  <p>用户必须在注册过程中提供准确、最新和完整的信息。用户负责维护其账户凭证的机密性。</p>
                  
                  <h3 className="font-semibold mt-4">3. 知识产权</h3>
                  <p>本平台的所有内容、功能和功能性均为我们所有，并受国际版权、商标和其他知识产权法律保护。</p>
                  
                  <h3 className="font-semibold mt-4">4. 用户行为</h3>
                  <p>用户同意不从事任何干扰或破坏平台或违反任何适用法律法规的活动。</p>
                  
                  <h3 className="font-semibold mt-4">5. 终止</h3>
                  <p>如有违反本服务条款的情况，我们保留立即终止或暂停访问我们平台的权利，恕不另行通知。</p>
                  
                  <h3 className="font-semibold mt-4">6. 适用法律</h3>
                  <p>这些条款应受香港特别行政区法律管辖并据其解释。</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
