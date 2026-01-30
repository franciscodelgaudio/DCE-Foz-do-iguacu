'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
// Se você usa Table mesmo, mantenha seus imports como já estavam.

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
    AlignJustify,
    Minus,
} from 'lucide-react'

import { ImageUpload } from '../editor/extensions/image-upload'

/**
 * ✅ Imagem com atributo align (left|center|right)
 * - center => mx-auto block
 * - right  => ml-auto block
 * - left   => mr-auto block
 */
const AlignedImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            align: {
                default: 'center',
                parseHTML: (element) => element.getAttribute('data-align') || 'center',
                renderHTML: (attrs) => {
                    const align = attrs.align || 'center'

                    const alignClass =
                        align === 'center'
                            ? 'mx-auto'
                            : align === 'right'
                                ? 'ml-auto'
                                : 'mr-auto'

                    return {
                        'data-align': align,
                        class: cn(
                            'max-w-full h-auto rounded-md block',
                            alignClass
                        ),
                    }
                },
            },
        }
    },
})

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
            variant="ghost"
            size="sm"
            className={cn(
                'h-9 px-2',
                active && 'bg-muted text-foreground',
            )}
            disabled={disabled}
            onClick={onClick}
            title={title}
            aria-label={title}
        >
            {children}
        </Button>
    )
}

export default function Tiptap({
    initialHtml,
    onChange,
    className,
    readOnly = false,
}) {
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

            // ✅ imagem com align
            AlignedImage.configure({
                allowBase64: true,
            }),

            ImageUpload.configure({
                maxFiles: 3,
                maxSizeMB: 5,
            }),

            // ✅ incluir listItem pra alinhar dentro de bullets
            TextAlign.configure({
                types: ['heading', 'paragraph', 'listItem'],
            }),

            // ❌ remover placeholder se você quer “texto real” e não placeholder
            // Placeholder.configure({ placeholder: 'Digite aqui…' }),
        ],
        content: initialHtml,
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[240px] w-full rounded-md border bg-background p-4 outline-none',
                    // IMPORTANTE: isso só funciona “de verdade” se você tiver @tailwindcss/typography
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

    // ✅ Se você editar notícia existente e initialHtml mudar, isso sincroniza
    React.useEffect(() => {
        if (!editor) return
        if (typeof initialHtml !== 'string') return

        const current = editor.getHTML()
        if (current !== initialHtml) {
            editor.commands.setContent(initialHtml, false)
        }
    }, [editor, initialHtml])

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

    // ✅ Alinha texto OU imagem (se imagem estiver selecionada)
    const applyAlign = React.useCallback(
        (align) => {
            if (!editor) return
            const chain = editor.chain().focus()

            // justify só faz sentido em texto
            if (align === 'justify') {
                chain.setTextAlign('justify').run()
                return
            }

            if (editor.isActive('image')) {
                chain.updateAttributes('image', { align }).run()
            } else {
                chain.setTextAlign(align).run()
            }
        },
        [editor]
    )

    const isAlignActive = React.useCallback(
        (align) => {
            if (!editor) return false
            if (align === 'justify') return editor.isActive({ textAlign: 'justify' })

            // Se imagem selecionada, usa atributo align da imagem
            if (editor.isActive('image')) return editor.isActive('image', { align })

            return editor.isActive({ textAlign: align })
        },
        [editor]
    )

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

                {/* ✅ alinhamento texto + imagem */}
                <ToolbarButton
                    title="Alinhar esquerda"
                    active={isAlignActive('left')}
                    onClick={() => applyAlign('left')}
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Centralizar"
                    active={isAlignActive('center')}
                    onClick={() => applyAlign('center')}
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Alinhar direita"
                    active={isAlignActive('right')}
                    onClick={() => applyAlign('right')}
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Justificar"
                    active={isAlignActive('justify')}
                    onClick={() => applyAlign('justify')}
                >
                    <AlignJustify className="h-4 w-4" />
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

            {/* BubbleMenu */}
            <BubbleMenu
                editor={editor}
                tippyOptions={{ offset: [0, 6], placement: 'top' }}
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
