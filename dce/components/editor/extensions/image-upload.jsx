'use client'

import * as React from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Plugin, PluginKey } from 'prosemirror-state'

async function defaultUpload(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Falha no upload da imagem')
    const data = await res.json()
    return data.url
}

function isImageFile(file) {
    return file.type.startsWith('image/')
}

function clampFiles(files, max) {
    return files.slice(0, max)
}

function ImageUploadView(props) {
    const { editor, node, getPos, extension } = props
    const uploadFn = extension.options.uploadFn ?? defaultUpload
    const maxFiles = extension.options.maxFiles ?? 3
    const maxSizeMB = extension.options.maxSizeMB ?? 5

    const inputRef = React.useRef(null)
    const [dragOver, setDragOver] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    const [error, setError] = React.useState(null)

    const replaceThisNodeWithImages = React.useCallback(
        async (files) => {
            const images = clampFiles(files.filter(isImageFile), maxFiles)

            // valida size
            const tooBig = images.find(f => f.size > maxSizeMB * 1024 * 1024)
            if (tooBig) {
                setError(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`)
                return
            }

            if (!images.length) return

            setBusy(true)
            setError(null)
            try {
                const srcs = []
                for (const f of images) {
                    const src = await uploadFn(f)
                    srcs.push(src)
                }

                const pos = getPos()
                const from = pos
                const to = pos + node.nodeSize

                // Substitui o placeholder por 1+ imagens (cada uma como node image)
                const content = srcs.flatMap((src, idx) => {
                    const img = { type: 'image', attrs: { src } }
                    // opcional: coloca um parágrafo depois pra continuar escrevendo
                    return idx === srcs.length - 1 ? [img, { type: 'paragraph' }] : [img, { type: 'paragraph' }]
                })

                editor
                    .chain()
                    .focus()
                    .insertContentAt({ from, to }, content)
                    .run()
            } finally {
                setBusy(false)
            }
        },
        [editor, getPos, node.nodeSize, uploadFn, maxFiles, maxSizeMB]
    )

    const onPickFiles = async (e) => {
        const files = Array.from(e.target.files ?? [])
        e.target.value = '' // permite selecionar o mesmo arquivo de novo
        await replaceThisNodeWithImages(files)
    }

    const onDrop = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOver(false)
        const files = Array.from(e.dataTransfer.files ?? [])
        await replaceThisNodeWithImages(files)
    }

    return (
        <NodeViewWrapper as="div" className="not-prose">
            <div
                contentEditable={false}
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={[
                    'my-6 flex min-h-[180px] w-full items-center justify-center rounded-xl border-2 border-dashed',
                    'bg-muted/20 px-6 py-10 text-center',
                    dragOver ? 'border-primary/70 bg-primary/5' : 'border-border',
                ].join(' ')}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPickFiles}
                />

                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                        {/* ícone simples (pode trocar por lucide) */}
                        <span className="text-sm">⬆️</span>
                    </div>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => inputRef.current?.click()}
                        className="text-sm font-medium underline underline-offset-4 disabled:opacity-60"
                    >
                        {busy ? 'Enviando…' : 'Clique para enviar ou arraste e solte'}
                    </button>

                    <div className="text-xs text-muted-foreground">
                        Máximo {maxFiles} arquivos, {maxSizeMB}MB cada.
                    </div>

                    {error ? (
                        <div className="mt-2 text-xs text-destructive">{error}</div>
                    ) : null}
                </div>
            </div>
        </NodeViewWrapper>
    )
}

export const ImageUpload = Node.create({
    name: 'imageUpload',

    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addOptions() {
        return {
            uploadFn: defaultUpload,
            maxFiles: 3,
            maxSizeMB: 5,
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-type="image-upload"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-upload' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageUploadView)
    },

    addCommands() {
        return {
            insertImageUpload:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({ type: this.name })
                    },
        }
    },

    // ✅ Drop/Paste de imagens em qualquer ponto do editor
    addProseMirrorPlugins() {
        const key = new PluginKey('image-upload-file-handler')
        const uploadFn = this.options.uploadFn ?? defaultUpload
        const maxFiles = this.options.maxFiles ?? 3
        const maxSizeMB = this.options.maxSizeMB ?? 5
        const getEditor = () => this.editor

        const insertImagesAt = async (pos, files) => {
            const editor = getEditor()
            if (!editor) return false

            const images = clampFiles(files.filter(isImageFile), maxFiles)
            const tooBig = images.find(f => f.size > maxSizeMB * 1024 * 1024)
            if (tooBig || !images.length) return false

            const srcs = []
            for (const f of images) srcs.push(await uploadFn(f))

            const content = srcs.flatMap(src => [
                { type: 'image', attrs: { src } },
                { type: 'paragraph' },
            ])

            editor.chain().focus().insertContentAt(pos, content).run()
            return true
        }

        return [
            new Plugin({
                key,
                props: {
                    handlePaste(view, event) {
                        // conteúdo copiado de dentro do editor na mesma aba — deixa o ProseMirror tratar via pm-slice
                        if (event.clipboardData?.getData('application/x-pm-slice')) return false

                        const files = Array.from(event.clipboardData?.files ?? [])

                        // arquivos de imagem colados do sistema operacional
                        if (files.some(isImageFile)) {
                            const pos = view.state.selection.from
                            void insertImagesAt(pos, files)
                            return true
                        }

                        // HTML do clipboard gerado por este editor (outra aba/página sem pm-slice)
                        const html = event.clipboardData?.getData('text/html') ?? ''
                        if (html) {
                            const imageNodes = parseEditorImagesFromHtml(html)
                            if (imageNodes.length > 0) {
                                const editor = getEditor()
                                const pos = view.state.selection.from
                                const content = imageNodes.flatMap(n => [n, { type: 'paragraph' }])
                                editor.chain().focus().insertContentAt(pos, content).run()
                                return true
                            }
                        }

                        return false
                    },

                    handleDrop(view, event) {
                        const files = Array.from(event.dataTransfer?.files ?? [])
                        if (!files.some(isImageFile)) return false

                        const coords = { left: event.clientX, top: event.clientY }
                        const dropPos = view.posAtCoords(coords)?.pos ?? view.state.selection.from
                        void insertImagesAt(dropPos, files)
                        return true
                    },
                },
            }),
        ]
    },
})

// Extrai nós de imagem do HTML gerado por este editor (marcadores data-align / data-image-crop)
function parseEditorImagesFromHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const nodes = []

    const walk = (el) => {
        if (el.nodeType !== 1) return

        if (el.matches('div[data-image-crop]')) {
            const img = el.querySelector('img')
            const src = img?.getAttribute('src')
            if (src) {
                nodes.push({
                    type: 'image',
                    attrs: {
                        src,
                        alt: img.getAttribute('alt') || '',
                        align: el.getAttribute('data-align') || 'center',
                        width: parseInt(el.getAttribute('data-width') || '300') || 300,
                        height: el.getAttribute('data-height') ? parseInt(el.getAttribute('data-height')) || null : null,
                        cropEnabled: true,
                        cropWidth: parseInt(el.getAttribute('data-crop-width') || '0') || null,
                        cropHeight: parseInt(el.getAttribute('data-crop-height') || '0') || null,
                        cropX: parseInt(el.getAttribute('data-crop-x') || '0') || 0,
                        cropY: parseInt(el.getAttribute('data-crop-y') || '0') || 0,
                    },
                })
            }
            return
        }

        // img com data-align é marcador exclusivo deste editor
        if (el.matches('img[src][data-align]')) {
            const src = el.getAttribute('src')
            if (src) {
                nodes.push({
                    type: 'image',
                    attrs: {
                        src,
                        alt: el.getAttribute('alt') || '',
                        align: el.getAttribute('data-align') || 'center',
                        width: parseInt(el.getAttribute('data-width') || el.getAttribute('width') || '300') || 300,
                        height: el.getAttribute('data-height') ? parseInt(el.getAttribute('data-height')) || null : null,
                        cropEnabled: false,
                    },
                })
            }
            return
        }

        Array.from(el.children).forEach(walk)
    }

    Array.from(tmp.children).forEach(walk)
    return nodes
}
