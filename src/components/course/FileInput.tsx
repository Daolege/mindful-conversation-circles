
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image, File } from 'lucide-react';

interface FileInputProps {
  onChange: (file: File | null) => void;
  accept?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  onChange,
  accept = '*/*',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClick = () => {
    // Trigger the hidden file input
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onChange(file);
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Choose icon based on file type
  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-5 w-5" />;
    
    const type = selectedFile.type;
    
    if (type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FileText className="h-5 w-5" />;
    }
    
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed flex flex-col"
          onClick={handleClick}
        >
          <Upload className="h-6 w-6 mb-2" />
          <span>点击选择或拖放文件</span>
        </Button>
      ) : (
        <div className="border rounded-md p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="truncate max-w-[200px]">
              <div className="font-medium truncate">{selectedFile.name}</div>
              <div className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
