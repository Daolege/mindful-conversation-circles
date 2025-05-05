
import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { 
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, Undo, Redo, Code 
} from 'lucide-react';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  // 处理图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件大小 (30MB 限制)
    if (file.size > 30 * 1024 * 1024) {
      alert('图片大小不能超过30MB');
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `homework-images/${Date.now()}.${fileExt}`;
      
      const { error, data } = await supabase.storage
        .from('homework-content')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('homework-content')
        .getPublicUrl(filePath);
        
      // 插入图片到编辑器
      editor.chain().focus().setImage({ src: publicUrl }).run();
      
      // 回调通知
      if (onImageUpload) {
        onImageUpload(publicUrl);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败: ' + (error.message || '未知错误'));
    }
  };

  // 添加链接
  const setLink = useCallback(() => {
    const url = window.prompt('输入链接地址:');
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link')
      .setLink({ href: url, target: '_blank' }).run();
  }, [editor]);

  return (
    <div className="border-b p-1 flex flex-wrap gap-1 mb-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        title="加粗"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        title="斜体"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={setLink}
        className={editor.isActive('link') ? 'bg-gray-200' : ''}
        title="添加链接"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        title="无序列表"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        title="有序列表"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
        title="代码块"
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        title="撤销"
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        title="重做"
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          title="上传图片"
          onClick={() => document.getElementById('image-upload').click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Placeholder.configure({
        placeholder: placeholder || '输入内容...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  return (
    <div className="border rounded-md">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="p-3 min-h-[150px] prose max-w-none" />
    </div>
  );
};

export default RichTextEditor;
