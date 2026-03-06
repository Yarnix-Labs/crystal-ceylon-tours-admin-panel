
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import FontFamily from '@tiptap/extension-font-family'
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { 
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Link as LinkIcon,
    Undo, Redo, Eraser, Heading1, Heading2, Heading3, Type,
    ChevronDown, Palette, Unlink
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useEffect, useState, useCallback } from 'react'
import { toast } from "sonner"

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

// Custom Link Dialog Component
const LinkDialog = ({ 
    editor, 
    isOpen, 
    onClose 
}: { 
    editor: Editor | null, 
    isOpen: boolean, 
    onClose: () => void 
}) => {
    const [url, setUrl] = useState('')
    const [openInNewTab, setOpenInNewTab] = useState(false)

    useEffect(() => {
        if (editor && isOpen) {
            const previousUrl = editor.getAttributes('link').href
            const previousTarget = editor.getAttributes('link').target
            setUrl(previousUrl || '')
            setOpenInNewTab(previousTarget === '_blank')
        }
    }, [editor, isOpen])

    const handleSave = () => {
        if (!editor) return

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            toast.success("Link removed")
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ 
                href: url, 
                target: openInNewTab ? '_blank' : null 
            }).run()
            toast.success("Link added successfully")
        }
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Insert / Edit Link</DialogTitle>
                    <DialogDescription>
                        Enter the URL for the selected text.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            URL
                        </Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-[calc(25%+1rem)]">
                        <Checkbox 
                            id="newTab" 
                            checked={openInNewTab} 
                            onCheckedChange={(checked) => setOpenInNewTab(checked as boolean)}
                        />
                        <Label htmlFor="newTab" className="cursor-pointer">Open in new tab</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TiptapEditor({ value, onChange, placeholder, className }: TiptapEditorProps) {
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
    const [toolbarColor, setToolbarColor] = useState('#000000')
    const [, setForceUpdate] = useState(0)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                heading: false, // Disable default heading to use custom configuration below
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }).extend({
                renderHTML({ node, HTMLAttributes }) {
                    const level = this.options.levels.includes(node.attrs.level)
                        ? node.attrs.level
                        : this.options.levels[0]
                    const classes = {
                        1: 'text-4xl font-extrabold mb-4 mt-6 text-foreground leading-tight',
                        2: 'text-3xl font-bold mb-3 mt-5 text-foreground leading-snug',
                        3: 'text-2xl font-semibold mb-2 mt-4 text-foreground leading-snug',
                    }
                    return [`h${level}`, { ...HTMLAttributes, class: classes[level as keyof typeof classes] }, 0]
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer hover:text-primary/80',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-h-[400px] object-cover my-4',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            if (html !== value) {
                onChange(html)
            }
        },
        onTransaction: () => {
            // Force re-render on every transaction (selection change, content change)
            // This ensures the toolbar buttons (bold, heading, etc.) update their active state
            setForceUpdate(prev => prev + 1)
        },
        editorProps: {
            attributes: {
                class: cn('prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-h1:text-4xl prose-h1:font-bold prose-h2:text-3xl prose-h2:font-semibold prose-h3:text-2xl prose-h3:font-medium mt-0 break-all w-full', className),
            },
        },
    })

    // Stable sync of external value changes
    useEffect(() => {
        if (!editor) return

        const currentContent = editor.getHTML()
        if (value !== currentContent) {
            if (value === '' && currentContent === '<p></p>') return
            editor.commands.setContent(value)
        }
    }, [value, editor])

    if (!editor) {
        return null
    }

    const setFontFamily = (font: string) => {
        if (font === 'Inter') {
            editor.chain().focus().unsetFontFamily().run()
        } else {
            editor.chain().focus().setFontFamily(font).run()
        }
    }

    const openLinkDialog = () => {
        setIsLinkDialogOpen(true)
    }

    return (
        <div className="border rounded-md overflow-hidden bg-background border-input shadow-sm flex flex-col">
            <LinkDialog 
                editor={editor} 
                isOpen={isLinkDialogOpen} 
                onClose={() => setIsLinkDialogOpen(false)} 
            />

            {/* Toolbar */}
            <div className="bg-muted/30 border-b p-1 flex flex-wrap gap-1 items-center sticky top-0 z-10 backdrop-blur-sm">
                
                {/* Font Family */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="h-8 gap-1 font-normal w-[120px] justify-between px-2">
                                 <span className="truncate text-xs">
                                     {editor.getAttributes('textStyle').fontFamily 
                                         ? editor.getAttributes('textStyle').fontFamily 
                                         : 'Default Font'}
                                 </span>
                                 <ChevronDown className="h-3 w-3 opacity-50" />
                             </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                             <DropdownMenuItem onClick={() => setFontFamily('Inter')} style={{ fontFamily: 'Inter' }}>Default (Inter)</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Arial')} style={{ fontFamily: 'Arial' }}>Arial</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Helvetica')} style={{ fontFamily: 'Helvetica' }}>Helvetica</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Times New Roman')} style={{ fontFamily: 'Times New Roman' }}>Times New Roman</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Garamond')} style={{ fontFamily: 'Garamond' }}>Garamond</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Georgia')} style={{ fontFamily: 'Georgia' }}>Georgia</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Verdana')} style={{ fontFamily: 'Verdana' }}>Verdana</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Courier New')} style={{ fontFamily: 'Courier New' }}>Courier New</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Trebuchet MS')} style={{ fontFamily: 'Trebuchet MS' }}>Trebuchet MS</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setFontFamily('Comic Sans MS')} style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans MS</DropdownMenuItem>
                         </DropdownMenuContent>
                     </DropdownMenu>
                </div>

                {/* Text Style (Headings) */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 font-normal w-[90px] justify-between px-2">
                                <span className="text-xs">
                                    {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
                                     editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                                     editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
                                     'Paragraph'}
                                </span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                                <Type className="mr-2 h-4 w-4" /> <span className="text-base text-foreground">Paragraph</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                                <Heading1 className="mr-2 h-4 w-4" /> <span className="text-2xl font-bold">Heading 1</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                                <Heading2 className="mr-2 h-4 w-4" /> <span className="text-xl font-semibold">Heading 2</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                                <Heading3 className="mr-2 h-4 w-4" /> <span className="text-lg font-medium">Heading 3</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                </div>

                {/* Formatting */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0">
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0">
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 p-0">
                        <UnderlineIcon className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 p-0">
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Color */}
                 <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                                <Palette className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-3" align="start">
                            <div className="grid grid-cols-7 gap-1 mb-3">
                                {[
                                    '#000000', '#4B5563', '#9CA3AF', '#FFFFFF', '#DC2626', '#EA580C', '#D97706',
                                    '#65A30D', '#16A34A', '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB',
                                    '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#E11D48', '#FF0000',
                                    '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#808000'
                                ].map((color) => (
                                    <button
                                        key={color}
                                        className="w-6 h-6 rounded-md border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                        style={{ backgroundColor: color }}
                                        onClick={() => editor.chain().focus().setColor(color).run()}
                                        title={color}
                                    />
                                ))}
                                <button
                                     className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center bg-transparent text-foreground hover:bg-muted"
                                     onClick={() => editor.chain().focus().unsetColor().run()}
                                     title="Reset Color"
                                >
                                    <Eraser className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Label className="text-xs">Custom:</Label>
                                <Input 
                                    type="color" 
                                    value={editor.getAttributes('textStyle').color || '#000000'}
                                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                                    className="h-8 w-full p-1 cursor-pointer" 
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                 </div>

                 {/* Alignment */}
                 <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} className="h-8 w-8 p-0">
                        <AlignLeft className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} className="h-8 w-8 p-0">
                        <AlignCenter className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} className="h-8 w-8 p-0">
                        <AlignRight className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} className="h-8 w-8 p-0">
                        <AlignJustify className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Insert */}
                <div className="flex items-center gap-0.5">
                    <Button 
                        variant={editor.isActive('link') ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={openLinkDialog} 
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
                                editor.chain().focus().unsetLink().run()
                                toast.success("Link removed")
                            }
                        }}
                        disabled={!editor.isActive('link')}
                        className="h-8 w-8 p-0"
                        title="Unlink"
                    >
                        <Unlink className="h-4 w-4" />
                    </Button>
                </div>
                
                 {/* Clear */}
                 <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().run()} className="h-8 w-8 p-0" title="Clear Formatting">
                        <Eraser className="h-4 w-4" />
                    </Button>
                 </div>

            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto bg-card" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
