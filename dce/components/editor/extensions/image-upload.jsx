'use client'

import * as React from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Plugin, PluginKey } from 'prosemirror-state'

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

async function defaultUpload(file) {
    // ✅ fácil pra começar (não recomendado pra produção)
    return await readFileAsDataURL(file)
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

        const insertImagesAt = async (view, pos, files) => {
            const images = clampFiles(files.filter(isImageFile), maxFiles)
            const tooBig = images.find(f => f.size > maxSizeMB * 1024 * 1024)
            if (tooBig || !images.length) return false

            const srcs = []
            for (const f of images) srcs.push(await uploadFn(f))

            // monta transação com imagens
            const { schema } = view.state
            const imageType = schema.nodes.image
            if (!imageType) return false

            let tr = view.state.tr
            let insertPos = pos

            for (const src of srcs) {
                const node = imageType.create({ src })
                tr = tr.insert(insertPos, node)
                insertPos += node.nodeSize
                // opcional: parágrafo depois
                const p = schema.nodes.paragraph?.create()
                if (p) {
                    tr = tr.insert(insertPos, p)
                    insertPos += p.nodeSize
                }
            }

            view.dispatch(tr.scrollIntoView())
            return true
        }

        return [
            new Plugin({
                key,
                props: {
                    handlePaste(view, event) {
                        const e = event
                        const files = Array.from(e.clipboardData?.files ?? [])
                        if (!files.some(isImageFile)) return false

                        const pos = view.state.selection.from
                        void insertImagesAt(view, pos, files)
                        return true
                    },

                    handleDrop(view, event) {
                        const e = event
                        const files = Array.from(e.dataTransfer?.files ?? [])
                        if (!files.some(isImageFile)) return false

                        const coords = { left: e.clientX, top: e.clientY }
                        const dropPos = view.posAtCoords(coords)?.pos ?? view.state.selection.from
                        void insertImagesAt(view, dropPos, files)
                        return true
                    },
                },
            }),
        ]
    },
})
