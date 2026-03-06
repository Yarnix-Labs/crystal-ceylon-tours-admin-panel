import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Bold, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Unlink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const LinkDialog = ({
  editor,
  isOpen,
  onClose,
}: {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [url, setUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  useEffect(() => {
    if (editor && isOpen) {
      const attrs = editor.getAttributes('link');
      setUrl(attrs.href || '');
      setOpenInNewTab(attrs.target === '_blank');
    }
  }, [editor, isOpen]);

  const handleSave = () => {
    if (!editor) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      toast.success('Link removed');
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url.trim(), target: openInNewTab ? '_blank' : null })
        .run();
      toast.success('Link added');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert / Edit Link</DialogTitle>
          <DialogDescription>Enter the URL for the selected text.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="simple-editor-url" className="text-right">
              URL
            </Label>
            <Input
              id="simple-editor-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 ml-[calc(25%+1rem)]">
            <Checkbox
              id="simple-editor-newtab"
              checked={openInNewTab}
              onCheckedChange={(checked) => setOpenInNewTab(checked as boolean)}
            />
            <Label htmlFor="simple-editor-newtab" className="cursor-pointer">
              Open in new tab
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  className,
  minHeight = '300px',
}: SimpleRichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert max-w-none focus:outline-none px-4 py-3 leading-relaxed w-full',
          className
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !(value === '' && current === '<p></p>')) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border-2 rounded-lg overflow-hidden bg-background border-border flex flex-col">
      <LinkDialog
        editor={editor}
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
      />

      {/* Toolbar: Bold, Text align, Link only */}
      <div className="bg-muted/30 border-b border-border p-1.5 flex flex-wrap gap-1 items-center">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <span className="w-px h-5 bg-border mx-0.5" aria-hidden />

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
          title="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
          title="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
          title="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>

        <span className="w-px h-5 bg-border mx-0.5" aria-hidden />

        <Button
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setIsLinkDialogOpen(true)}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
              toast.success('Link removed');
            }
          }}
          disabled={!editor.isActive('link')}
          className="h-8 w-8 p-0"
          title="Remove link"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="flex-1 overflow-auto bg-card"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
