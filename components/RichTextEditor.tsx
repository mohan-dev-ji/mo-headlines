"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function RichTextEditor({
  onChange,
  initialContent,
}: {
  onChange: (content: string) => void;
  initialContent?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "<p>Start writing your article...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return <EditorContent editor={editor} className="border p-2 rounded" />;
}
