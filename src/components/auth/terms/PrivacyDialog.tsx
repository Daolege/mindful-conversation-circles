
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-8">
            {/* English Version */}
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
            
            {/* Traditional Chinese Version */}
            <div className="space-y-4 pt-8 border-t">
              <h2 className="text-xl font-semibold">私隱政策</h2>
              <div className="space-y-2 text-sm">
                <p>最後更新日期：2025年4月21日</p>
                
                <h3 className="font-semibold mt-4">1. 資料收集</h3>
                <p>我們收集您在平台註冊時自願提供的個人資料，包括但不限於您的姓名、電郵地址和聯絡資料。</p>
                
                <h3 className="font-semibold mt-4">2. 資料使用</h3>
                <p>我們使用收集的資料來提供和改進我們的服務、與您溝通並遵守法律義務。我們不會向第三方出售或出租您的個人資料。</p>
                
                <h3 className="font-semibold mt-4">3. 資料安全</h3>
                <p>我們實施適當的安全措施，以保護您的個人資料免受未經授權的存取、更改、披露或銷毀。</p>
                
                <h3 className="font-semibold mt-4">4. Cookies</h3>
                <p>我們使用cookies和類似的追蹤技術來增強您的瀏覽體驗。您可以通過瀏覽器設置選擇禁用cookies。</p>
                
                <h3 className="font-semibold mt-4">5. 用戶權利</h3>
                <p>根據香港《個人資料（私隱）條例》，您有權存取、更正和刪除您的個人資料。</p>
                
                <h3 className="font-semibold mt-4">6. 私隱政策變更</h3>
                <p>我們保留隨時更新本私隱政策的權利。變更將在本平台發布後立即生效。</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
