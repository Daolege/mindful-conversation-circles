
import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, 
  List, ListOrdered, Undo, Redo, Code 
} from 'lucide-react';

// 自定义样式，确保列表在编辑器中正确显示
import './RichTextEditorStyles.css';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  // 改进的图片上传处理函数，防止事件冒泡
  const handleImageUpload = async (e) => {
    // 防止事件冒泡，阻止表单提交
    e.preventDefault();
    e.stopPropagation();
    
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
      
      // 显示上传中状态
      const uploadingMessage = editor.view.dom.parentNode.querySelector('.upload-status') || 
        (() => {
          const statusEl = document.createElement('div');
          statusEl.className = 'upload-status text-sm text-blue-500 p-2';
          statusEl.textContent = '正在上传图片...';
          editor.view.dom.parentNode.appendChild(statusEl);
          return statusEl;
        })();
      
      const { error, data } = await supabase.storage
        .from('homework-content')
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('homework-content')
        .getPublicUrl(filePath);
      
      // 显示上传成功状态
      uploadingMessage.textContent = '图片上传成功';
      uploadingMessage.className = 'upload-status text-sm text-green-500 p-2';
      
      // 插入图片到编辑器
      editor.chain().focus().setImage({ src: publicUrl }).run();
      
      // 回调通知
      if (onImageUpload) {
        onImageUpload(publicUrl);
      }
      
      // 2秒后移除状态消息
      setTimeout(() => {
        uploadingMessage.remove();
      }, 2000);
      
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败: ' + (error.message || '未知错误'));
      
      // 显示上传失败状态
      const uploadingMessage = editor.view.dom.parentNode.querySelector('.upload-status');
      if (uploadingMessage) {
        uploadingMessage.textContent = '图片上传失败';
        uploadingMessage.className = 'upload-status text-sm text-red-500 p-2';
        
        // 2秒后移除状态消息
        setTimeout(() => {
          uploadingMessage.remove();
        }, 2000);
      }
    }
    
    // 重置文件输入，允许再次选择同一文件
    e.target.value = '';
  };

  // 改进的图片按钮点击处理函数
  const handleImageButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('image-upload').click();
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
        onClick={() => {
          console.log('点击无序列表按钮');
          editor.chain().focus().toggleBulletList().run();
        }}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        title="无序列表"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          console.log('点击有序列表按钮');
          editor.chain().focus().toggleOrderedList().run();
        }}
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
          onClick={handleImageButtonClick} // 使用改进的点击处理函数
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          onClick={(e) => e.stopPropagation()} // 防止点击事件冒泡
        />
      </div>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder }) => {
  // 调试内容
  console.log('富文本编辑器初始内容:', value);
  
  // 修复空内容处理
  const sanitizedValue = React.useMemo(() => {
    // 如果值是null或undefined，返回空字符串
    if (value === null || value === undefined) {
      return '';
    }
    // 如果已经是字符串，原样返回
    if (typeof value === 'string') {
      return value;
    }
    // 其他情况尝试转换为字符串
    return String(value);
  }, [value]);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'editor-list-ul',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'editor-list-ol',
          },
        },
      }),
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
    content: sanitizedValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('编辑器内容已更新:', html);
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none prose-lists-in-editor',
      },
    },
  });
  
  // 监听value变化，并更新编辑器内容
  useEffect(() => {
    if (editor && sanitizedValue !== editor.getHTML()) {
      console.log('外部内容变化，更新编辑器:', sanitizedValue);
      editor.commands.setContent(sanitizedValue);
    }
  }, [sanitizedValue, editor]);

  // 监听列表命令并记录日志
  React.useEffect(() => {
    if (editor) {
      const originalToggleBulletList = editor.commands.toggleBulletList;
      const originalToggleOrderedList = editor.commands.toggleOrderedList;
      
      editor.commands.toggleBulletList = () => {
        console.log('执行 toggleBulletList 命令');
        return originalToggleBulletList();
      };
      
      editor.commands.toggleOrderedList = () => {
        console.log('执行 toggleOrderedList 命令');
        return originalToggleOrderedList();
      };
    }
  }, [editor]);

  // 阻止编辑器内部事件冒泡到父级表单
  const handleEditorClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="border rounded-md" onClick={handleEditorClick}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="p-3 min-h-[150px] prose max-w-none editor-content" 
        onClick={handleEditorClick}
      />
    </div>
  );
};

export default RichTextEditor;
