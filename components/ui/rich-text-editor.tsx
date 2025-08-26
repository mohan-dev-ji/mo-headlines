"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useEffect, useCallback } from "react";

interface RichTextEditorProps {
  onChange: (content: string) => void;
  initialContent?: string;
  content?: string;
}

export function RichTextEditor({
  onChange,
  initialContent,
  content,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-semibold',
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4 leading-relaxed',
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content: content || initialContent || "<p>Start writing your article...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'p-4 min-h-[300px] focus:outline-none',
        style: 'line-height: 1.6;',
      },
    },
  });

  // Update editor content when content changes
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Legacy support for initialContent
  useEffect(() => {
    if (editor && initialContent !== undefined && !content) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, content]);

  const handleButtonClick = useCallback((callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  }, []);

  const handleHeading1 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  }, [editor]);

  const handleHeading2 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  }, [editor]);

  const handleHeading3 = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(handleHeading1)}
          data-active={editor.isActive("heading", { level: 1 })}
          type="button"
          className="text-headline-secondary"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(handleHeading2)}
          data-active={editor.isActive("heading", { level: 2 })}
          type="button"
          className="text-headline-secondary"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(handleHeading3)}
          data-active={editor.isActive("heading", { level: 3 })}
          type="button"
          className="text-headline-secondary"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
          data-active={editor.isActive("bold")}
          type="button"
          className="text-headline-secondary"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
          data-active={editor.isActive("italic")}
          type="button"
          className="text-headline-secondary"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
          data-active={editor.isActive("bulletList")}
          type="button"
          className="text-headline-secondary"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
          data-active={editor.isActive("orderedList")}
          type="button"
          className="text-headline-secondary"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBlockquote().run())}
          data-active={editor.isActive("blockquote")}
          type="button"
          className="text-headline-secondary"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => {
            const url = window.prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          })}
          type="button"
          className="text-headline-secondary"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().undo().run())}
          type="button"
          className="text-headline-secondary"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().redo().run())}
          type="button"
          className="text-headline-secondary"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="prose prose-sm max-w-none [&_.ProseMirror]:p-4 [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-6 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:my-5 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:my-4 [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
