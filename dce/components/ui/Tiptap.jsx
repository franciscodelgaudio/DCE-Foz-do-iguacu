'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Quote,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Link2,
    ImagePlus,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Table as TableIcon,
    Minus,
} from 'lucide-react'
import { ImageUpload } from '../editor/extensions/image-upload'


function ToolbarButton({
    active,
    disabled,
    onClick,
    children,
    title,
}) {
    return (
        <Button
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 px-2"
            disabled={disabled}
            onClick={onClick}
            title={title}
            aria-label={title}
        >
            {children}
        </Button>
    )
}

export default function Tiptap({ initialHtml, onChange, className, readOnly = false }) {
    const editor = useEditor({
        immediatelyRender: false,
        editable: !readOnly,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: { HTMLAttributes: { class: 'rounded-md bg-muted p-3' } },
            }),
            Underline,
            Highlight,
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: { class: 'underline underline-offset-4' },
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: { class: 'rounded-md max-w-full' },
            }),

            // ✅ o “slot” igual do Simple Editor
            ImageUpload.configure({
                maxFiles: 3,
                maxSizeMB: 5,
                // uploadFn: async (file) => { ... } // depois você troca por upload real
            }),

            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Digite aqui…' }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: initialHtml,
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[240px] w-full rounded-md border bg-background p-4 outline-none',
                    'prose prose-sm sm:prose-base dark:prose-invert max-w-none',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background'
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.({
                html: editor.getHTML(),
                json: editor.getJSON(),
                text: editor.getText(),
            })
        },
    })

    const setLink = React.useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL do link:', previousUrl || 'https://')
        if (url === null) return

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
    }, [editor])

    const addImage = React.useCallback(() => {
        if (!editor) return
        const url = window.prompt('URL da imagem:')
        if (!url) return
        editor.chain().focus().setImage({ src: url.trim() }).run()
    }, [editor])

    if (!editor) return null

    return (
        <div className={cn('w-full', className)}>
            {/* Toolbar */}
            <div className="mb-2 flex flex-wrap items-center gap-1 rounded-md border bg-background p-2">
                <ToolbarButton
                    title="Negrito"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Itálico"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Sublinhado"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Riscado"
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Highlight"
                    active={editor.isActive('highlight')}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    <Highlighter className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarButton
                    title="H1"
                    active={editor.isActive('heading', { level: 1 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="H2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="H3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarButton
                    title="Lista"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Lista numerada"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Citação"
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Código inline"
                    active={editor.isActive('code')}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Linha horizontal"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarButton
                    title="Alinhar esquerda"
                    active={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Centralizar"
                    active={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Alinhar direita"
                    active={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <ToolbarButton
                    title="Link"
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    <Link2 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Inserir upload de imagem"
                    onClick={() => editor.chain().focus().insertImageUpload().run()}
                >
                    <ImagePlus className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Tabela 3x3"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                            .run()
                    }
                >
                    <TableIcon className="h-4 w-4" />
                </ToolbarButton>

                <div className="ml-auto flex items-center gap-1">
                    <ToolbarButton
                        title="Desfazer"
                        disabled={!editor.can().chain().focus().undo().run()}
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        title="Refazer"
                        disabled={!editor.can().chain().focus().redo().run()}
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* BubbleMenu (aparece ao selecionar texto) */}
            <BubbleMenu
                editor={editor}
                options={{ offset: 6, placement: 'top' }}
                className="flex items-center gap-1 rounded-md border bg-background p-1 shadow"
            >
                <ToolbarButton
                    title="Negrito"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Itálico"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Sublinhado"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    title="Link"
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    <Link2 className="h-4 w-4" />
                </ToolbarButton>
            </BubbleMenu>

            <EditorContent editor={editor} />
        </div>
    )
}
