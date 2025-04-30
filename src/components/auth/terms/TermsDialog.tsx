
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-8">
            {/* English Version */}
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
            
            {/* Traditional Chinese Version */}
            <div className="space-y-4 pt-8 border-t">
              <h2 className="text-xl font-semibold">服務條款</h2>
              <div className="space-y-2 text-sm">
                <p>最後更新日期：2025年4月21日</p>
                
                <h3 className="font-semibold mt-4">1. 條款接受</h3>
                <p>透過訪問和使用本平台，即表示您同意受這些服務條款以及所有適用法律法規的約束。如果您不同意任何這些條款，您將被禁止使用或訪問本平台。</p>
                
                <h3 className="font-semibold mt-4">2. 用戶註冊</h3>
                <p>用戶必須在註冊過程中提供準確、最新和完整的信息。用戶負責維護其帳戶憑證的機密性。</p>
                
                <h3 className="font-semibold mt-4">3. 知識產權</h3>
                <p>本平台的所有內容、功能和功能性均為我們所有，並受國際版權、商標和其他知識產權法律保護。</p>
                
                <h3 className="font-semibold mt-4">4. 用戶行為</h3>
                <p>用戶同意不從事任何干擾或破壞平台或違反任何適用法律法規的活動。</p>
                
                <h3 className="font-semibold mt-4">5. 終止</h3>
                <p>如有違反本服務條款的情況，我們保留立即終止或暫停訪問我們平台的權利，恕不另行通知。</p>
                
                <h3 className="font-semibold mt-4">6. 適用法律</h3>
                <p>這些條款應受香港特別行政區法律管轄並據其解釋。</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
