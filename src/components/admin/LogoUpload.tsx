
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Upload, Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function LogoUpload({ currentLogoUrl, onLogoUpdate }: {
  currentLogoUrl?: string | null;
  onLogoUpdate: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "请上传小于5MB的图片",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from("logos")
          .getPublicUrl(data.path);
          
        onLogoUpdate(publicUrl);
        toast({
          title: "上传成功",
          description: "Logo已更新",
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "上传失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-24 overflow-hidden rounded-lg border bg-muted">
          <AspectRatio ratio={1}>
            {currentLogoUrl ? (
              <img
                src={currentLogoUrl}
                alt="Site Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </div>
        <div className="flex-1">
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={handleButtonClick}
            className="relative"
            type="button"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                上传新Logo
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
