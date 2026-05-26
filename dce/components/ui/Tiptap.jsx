'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { TextSelection } from 'prosemirror-state'
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

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
    Columns2,
    Lock,
    Unlock,
    Maximize2,
    Scissors,
    X,
} from 'lucide-react'

import { ImageUpload } from '../editor/extensions/image-upload'
import { Columns, Column } from '../editor/extensions/columns'
import { ParagraphSpacing } from '../editor/extensions/paragraph-spacing'

function ResizableImageView({ node, updateAttributes, selected, editor, getPos }) {
    const { src, alt, title, align, width, height, cropEnabled, cropWidth, cropHeight, cropX, cropY, caption } = node.attrs

    const [naturalRatio, setNaturalRatio] = React.useState(1)
    const [contextMenu, setContextMenu] = React.useState(null)

    // resize modal
    const [showResize, setShowResize] = React.useState(false)
    const [resW, setResW] = React.useState('')
    const [resH, setResH] = React.useState('')
    const [resLock, setResLock] = React.useState(true)

    // crop modal
    const [showCrop, setShowCrop] = React.useState(false)
    const [cW, setCW] = React.useState('')
    const [cH, setCH] = React.useState('')
    const [cX, setCX] = React.useState('0')
    const [cY, setCY] = React.useState('0')
    const [cLock, setCLock] = React.useState(false)
    const [cLockRatio, setCLockRatio] = React.useState(1)

    React.useEffect(() => {
        if (!contextMenu) return
        const close = () => setContextMenu(null)
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [contextMenu])

    const w = Number(width) || 300
    const h = height ? Number(height) : null

    const marginStyle =
        align === 'center' ? { margin: '0 auto' } :
        align === 'right'  ? { marginLeft: 'auto', marginRight: 0 } :
                             { marginLeft: 0, marginRight: 'auto' }

    const handleResizeStart = React.useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        const startX = e.clientX
        const startWidth = Number(width) || 300
        const onMove = (ev) => {
            const newWidth = Math.max(80, startWidth + (ev.clientX - startX))
            updateAttributes({ width: Math.round(newWidth) })
        }
        const onUp = () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }, [updateAttributes, width])

    const openResizeModal = () => {
        setResW(String(w))
        setResH(h ? String(h) : String(Math.round(w / naturalRatio)))
        setResLock(true)
        setContextMenu(null)
        setShowResize(true)
    }

    const openCropModal = () => {
        setCW(cropEnabled && cropWidth ? String(cropWidth) : String(w))
        setCH(cropEnabled && cropHeight ? String(cropHeight) : String(Math.round(w / naturalRatio)))
        setCX(String(cropX ?? 0))
        setCY(String(cropY ?? 0))
        setCLock(false)
        setContextMenu(null)
        setShowCrop(true)
    }

    const handleResWChange = (val) => {
        setResW(val)
        if (resLock && naturalRatio > 0) {
            const n = parseInt(val)
            if (!isNaN(n) && n > 0) setResH(String(Math.round(n / naturalRatio)))
        }
    }
    const handleResHChange = (val) => {
        setResH(val)
        if (resLock && naturalRatio > 0) {
            const n = parseInt(val)
            if (!isNaN(n) && n > 0) setResW(String(Math.round(n * naturalRatio)))
        }
    }
    const handleCWChange = (val) => {
        setCW(val)
        if (cLock && cLockRatio > 0) {
            const n = parseInt(val)
            if (!isNaN(n) && n > 0) setCH(String(Math.round(n / cLockRatio)))
        }
    }
    const handleCHChange = (val) => {
        setCH(val)
        if (cLock && cLockRatio > 0) {
            const n = parseInt(val)
            if (!isNaN(n) && n > 0) setCW(String(Math.round(n * cLockRatio)))
        }
    }

    const applyResize = () => {
        updateAttributes({
            width: Math.max(10, parseInt(resW) || w),
            height: resLock ? null : (parseInt(resH) || null),
        })
        setShowResize(false)
    }

    const applyCrop = () => {
        updateAttributes({
            cropEnabled: true,
            cropWidth: Math.max(1, parseInt(cW) || w),
            cropHeight: Math.max(1, parseInt(cH) || Math.round(w / naturalRatio)),
            cropX: Math.max(0, parseInt(cX) || 0),
            cropY: Math.max(0, parseInt(cY) || 0),
        })
        setShowCrop(false)
    }

    const clearCrop = () => {
        updateAttributes({ cropEnabled: false, cropWidth: null, cropHeight: null, cropX: 0, cropY: 0 })
        setShowCrop(false)
    }

    const wrapperSize = cropEnabled
        ? { width: `${Number(cropWidth) || w}px`, height: `${Number(cropHeight) || Math.round(w / naturalRatio)}px`, overflow: 'hidden', borderRadius: 6 }
        : { width: `${w}px` }

    const imgStyle = cropEnabled
        ? { width: `${w}px`, height: h ? `${h}px` : 'auto', display: 'block', borderRadius: 6, marginLeft: `-${Number(cropX) || 0}px`, marginTop: `-${Number(cropY) || 0}px`, maxWidth: 'none' }
        : { width: '100%', height: h ? `${h}px` : 'auto', display: 'block', borderRadius: 6 }

    const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
    const lockBtnStyle = (active) => ({
        marginTop: 20, background: active ? '#eff6ff' : '#f9fafb',
        border: `1px solid ${active ? '#93c5fd' : '#d1d5db'}`,
        borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
        color: active ? '#2563eb' : '#6b7280', display: 'flex', alignItems: 'center', flexShrink: 0,
    })

    const handleMouseDown = React.useCallback((e) => {
        if (!e.shiftKey || !editor.isEditable) return
        e.preventDefault()
        e.stopPropagation()
        const pos = getPos()
        const anchor = editor.state.selection.anchor
        const head = anchor <= pos ? pos + node.nodeSize : pos
        editor.view.dispatch(
            editor.state.tr.setSelection(TextSelection.create(editor.state.doc, anchor, head))
        )
    }, [editor, getPos, node.nodeSize])

    return (
        <NodeViewWrapper>
            <div
                contentEditable={false}
                onMouseDown={handleMouseDown}
                onContextMenu={(e) => {
                    if (!editor.isEditable) return
                    e.preventDefault()
                    e.stopPropagation()
                    setContextMenu({ x: e.clientX, y: e.clientY })
                }}
                style={{
                    display: 'block', position: 'relative',
                    outline: selected && editor.isEditable ? '2px solid #3b82f6' : 'none',
                    outlineOffset: 2, ...marginStyle, ...wrapperSize,
                }}
            >
                <img
                    src={src} alt={alt || ''} title={title} draggable={false}
                    onLoad={(e) => { const r = e.target.naturalWidth / e.target.naturalHeight; if (r > 0) setNaturalRatio(r) }}
                    style={imgStyle}
                />
                {editor.isEditable && selected && !cropEnabled && (
                    <div
                        onMouseDown={handleResizeStart}
                        style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, background: 'white', border: '2px solid #3b82f6', borderRadius: 2, cursor: 'nwse-resize', zIndex: 1 }}
                    />
                )}
            </div>

            {/* Caption */}
            {(editor.isEditable || caption) && (
                <div
                    contentEditable={false}
                    style={{ ...marginStyle, width: wrapperSize.width, marginTop: 4 }}
                >
                    {editor.isEditable ? (
                        <input
                            type="text"
                            value={caption || ''}
                            onChange={e => updateAttributes({ caption: e.target.value })}
                            onMouseDown={e => e.stopPropagation()}
                            placeholder="Adicionar legenda..."
                            style={{
                                width: '100%',
                                border: 'none',
                                borderBottom: '1px dashed #d1d5db',
                                background: 'transparent',
                                textAlign: 'center',
                                fontSize: 13,
                                color: caption ? '#374151' : '#9ca3af',
                                outline: 'none',
                                padding: '4px 0',
                            }}
                        />
                    ) : (
                        <span style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                            {caption}
                        </span>
                    )}
                </div>
            )}

            {/* Context menu */}
            {contextMenu && createPortal(
                <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 99999, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: 170, overflow: 'hidden' }}
                >
                    {[
                        { label: 'Redimensionar', icon: <Maximize2 size={15} />, action: openResizeModal },
                        { label: 'Cortar', icon: <Scissors size={15} />, action: openCropModal },
                    ].map(({ label, icon, action }) => (
                        <button
                            key={label}
                            onClick={action}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left', color: '#111827' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* Resize modal */}
            {showResize && createPortal(
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseDown={() => setShowResize(false)}
                >
                    <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.25)', fontFamily: 'inherit' }} onMouseDown={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>Redimensionar imagem</span>
                            <button onClick={() => setShowResize(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', display: 'flex' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Largura (px)</label>
                                <input type="number" min={10} value={resW} onChange={(e) => handleResWChange(e.target.value)} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                            </div>
                            <button onClick={() => setResLock(!resLock)} title={resLock ? 'Clique para desbloquear proporção' : 'Clique para travar proporção'} style={lockBtnStyle(resLock)}>
                                {resLock ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Altura (px)</label>
                                <input type="number" min={1} value={resH} disabled={resLock} onChange={(e) => handleResHChange(e.target.value)}
                                    style={{ ...inputStyle, background: resLock ? '#f9fafb' : 'white', color: resLock ? '#9ca3af' : 'inherit' }} />
                            </div>
                        </div>
                        {resLock && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>Altura calculada automaticamente para manter proporção.</p>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowResize(false)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>Cancelar</button>
                            <button onClick={applyResize} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Aplicar</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Crop modal */}
            {showCrop && createPortal(
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseDown={() => setShowCrop(false)}
                >
                    <div style={{ background: 'white', borderRadius: 12, padding: 24, width: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.25)', fontFamily: 'inherit' }} onMouseDown={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>Cortar imagem</span>
                            <button onClick={() => setShowCrop(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', display: 'flex' }}><X size={18} /></button>
                        </div>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, marginTop: 0 }}>Defina a área visível e o ponto de início do corte.</p>

                        <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Área visível</p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Largura (px)</label>
                                <input type="number" min={1} value={cW} onChange={(e) => handleCWChange(e.target.value)} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                            </div>
                            <button
                                onClick={() => { const nl = !cLock; setCLock(nl); if (nl) { const ww = parseInt(cW) || 1; const hh = parseInt(cH) || 1; setCLockRatio(ww / hh) } }}
                                title={cLock ? 'Clique para desbloquear proporção' : 'Clique para travar proporção'}
                                style={lockBtnStyle(cLock)}
                            >
                                {cLock ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Altura (px)</label>
                                <input type="number" min={1} value={cH} onChange={(e) => handleCHChange(e.target.value)} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                            </div>
                        </div>

                        <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Início do corte (deslocamento)</p>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>X — da esquerda (px)</label>
                                <input type="number" min={0} value={cX} onChange={(e) => setCX(e.target.value)} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Y — do topo (px)</label>
                                <input type="number" min={0} value={cY} onChange={(e) => setCY(e.target.value)} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#d1d5db'} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                {cropEnabled && (
                                    <button onClick={clearCrop} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                                        Remover corte
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setShowCrop(false)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 14, color: '#374151' }}>Cancelar</button>
                                <button onClick={applyCrop} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Aplicar</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </NodeViewWrapper>
    )
}

const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            align: {
                default: 'center',
                parseHTML: (el) => el.getAttribute('data-align') ?? 'center',
                renderHTML: () => ({}),
            },
            width: {
                default: 300,
                parseHTML: (el) => parseInt(el.getAttribute('data-width') ?? el.getAttribute('width') ?? '300') || 300,
                renderHTML: () => ({}),
            },
            height: {
                default: null,
                parseHTML: (el) => { const v = el.getAttribute('data-height'); return v ? parseInt(v) || null : null },
                renderHTML: () => ({}),
            },
            cropEnabled: {
                default: false,
                parseHTML: (el) => el.getAttribute('data-image-crop') === 'true',
                renderHTML: () => ({}),
            },
            cropWidth: {
                default: null,
                parseHTML: (el) => { const v = el.getAttribute('data-crop-width'); return v ? parseInt(v) || null : null },
                renderHTML: () => ({}),
            },
            cropHeight: {
                default: null,
                parseHTML: (el) => { const v = el.getAttribute('data-crop-height'); return v ? parseInt(v) || null : null },
                renderHTML: () => ({}),
            },
            cropX: {
                default: 0,
                parseHTML: (el) => parseInt(el.getAttribute('data-crop-x') ?? '0') || 0,
                renderHTML: () => ({}),
            },
            cropY: {
                default: 0,
                parseHTML: (el) => parseInt(el.getAttribute('data-crop-y') ?? '0') || 0,
                renderHTML: () => ({}),
            },
            caption: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-caption') ?? '',
                renderHTML: (attrs) => attrs.caption ? { 'data-caption': attrs.caption } : {},
            },
        }
    },

    parseHTML() {
        return [
            { tag: 'img[src]' },
            {
                tag: 'div[data-image-crop]',
                getAttrs: (el) => {
                    const img = el.querySelector('img')
                    if (!img) return false
                    return {
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt') || '',
                        title: img.getAttribute('title') || '',
                        align: el.getAttribute('data-align') || 'center',
                        width: parseInt(el.getAttribute('data-width') || '300') || 300,
                        height: el.getAttribute('data-height') ? parseInt(el.getAttribute('data-height')) || null : null,
                        cropEnabled: true,
                        cropWidth: parseInt(el.getAttribute('data-crop-width') || '0') || null,
                        cropHeight: parseInt(el.getAttribute('data-crop-height') || '0') || null,
                        cropX: parseInt(el.getAttribute('data-crop-x') || '0') || 0,
                        cropY: parseInt(el.getAttribute('data-crop-y') || '0') || 0,
                        caption: el.getAttribute('data-caption') || el.querySelector('img')?.getAttribute('data-caption') || '',
                    }
                },
            },
            {
                tag: 'div[data-image-wrapper]',
                getAttrs: (el) => {
                    const img = el.querySelector('img')
                    if (!img) return false
                    return {
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt') || '',
                        title: img.getAttribute('title') || '',
                        align: el.getAttribute('data-align') || 'center',
                        width: parseInt(el.getAttribute('data-width') || '300') || 300,
                        height: el.getAttribute('data-height') ? parseInt(el.getAttribute('data-height')) || null : null,
                        caption: el.getAttribute('data-caption') || img.getAttribute('data-caption') || '',
                    }
                },
            },
            {
                tag: 'figure',
                getAttrs: (el) => {
                    const img = el.querySelector('img')
                    if (!img) return false
                    const caption = el.getAttribute('data-caption') || el.querySelector('figcaption')?.textContent || ''
                    const isCrop = el.getAttribute('data-image-crop') === 'true'
                    return {
                        src: img.getAttribute('src') || '',
                        alt: img.getAttribute('alt') || '',
                        title: img.getAttribute('title') || '',
                        align: el.getAttribute('data-align') || 'center',
                        width: parseInt(el.getAttribute('data-width') || '300') || 300,
                        height: el.getAttribute('data-height') ? parseInt(el.getAttribute('data-height')) || null : null,
                        cropEnabled: isCrop,
                        cropWidth: isCrop ? parseInt(el.getAttribute('data-crop-width') || '0') || null : null,
                        cropHeight: isCrop ? parseInt(el.getAttribute('data-crop-height') || '0') || null : null,
                        cropX: isCrop ? parseInt(el.getAttribute('data-crop-x') || '0') || 0 : 0,
                        cropY: isCrop ? parseInt(el.getAttribute('data-crop-y') || '0') || 0 : 0,
                        caption,
                    }
                },
            },
        ]
    },

    renderHTML({ node, HTMLAttributes }) {
        const { src, alt, title } = HTMLAttributes
        const align = node.attrs.align ?? 'center'
        const w = Number(node.attrs.width ?? 300) || 300
        const h = node.attrs.height ? Number(node.attrs.height) : null
        const cEnabled = node.attrs.cropEnabled
        const cW = Number(node.attrs.cropWidth) || w
        const cH = Number(node.attrs.cropHeight) || w
        const cX = Number(node.attrs.cropX) || 0
        const cY = Number(node.attrs.cropY) || 0
        const caption = node.attrs.caption || ''

        const marginStyle =
            align === 'center' ? 'margin:0 auto' :
            align === 'right'  ? 'margin-left:auto;margin-right:0' :
                                 'margin-left:0;margin-right:auto'

        if (caption) {
            const cropFigcaption = ['figcaption', { style: `display:block;width:${cW}px;margin:0 auto;text-align:center;font-size:0.85em;color:#6b7280;margin-top:4px;` }, caption]
            const imgFigcaption  = ['figcaption', { style: `display:block;width:${w}px;margin:0 auto;text-align:center;font-size:0.85em;color:#6b7280;margin-top:4px;` }, caption]

            if (cEnabled) {
                return ['div', {
                    'data-image-crop': 'true',
                    'data-caption': caption,
                    'data-align': align,
                    'data-width': w,
                    'data-height': h ?? '',
                    'data-crop-width': cW,
                    'data-crop-height': cH,
                    'data-crop-x': cX,
                    'data-crop-y': cY,
                    style: `display:block;width:${cW}px;${marginStyle}`,
                },
                    ['div', { style: `overflow:hidden;width:${cW}px;height:${cH}px;display:block;border-radius:6px;` },
                        ['img', { src: src || '', alt: alt || '', title: title || '', 'data-caption': caption, draggable: 'false', style: `width:${w}px;height:${h ? h + 'px' : 'auto'};display:block;margin-left:-${cX}px;margin-top:-${cY}px;max-width:none;` }]],
                    cropFigcaption,
                ]
            }
            return ['div', {
                'data-image-wrapper': 'true',
                'data-caption': caption,
                'data-align': align,
                'data-width': w,
                'data-height': h ?? '',
                style: `display:block;width:${w}px;${marginStyle}`,
            },
                ['img', { src: src || '', alt: alt || '', title: title || '', 'data-caption': caption, width: w, style: `width:${w}px;height:${h ? h + 'px' : 'auto'};display:block;border-radius:6px;margin-bottom:0;` }],
                imgFigcaption,
            ]
        }

        if (cEnabled) {
            return ['div', {
                'data-image-crop': 'true',
                'data-align': align,
                'data-width': w,
                'data-height': h ?? '',
                'data-crop-width': cW,
                'data-crop-height': cH,
                'data-crop-x': cX,
                'data-crop-y': cY,
                style: `overflow:hidden;width:${cW}px;height:${cH}px;display:block;border-radius:6px;${marginStyle}`,
            }, ['img', {
                src: src || '',
                alt: alt || '',
                title: title || '',
                draggable: 'false',
                style: `width:${w}px;height:${h ? h + 'px' : 'auto'};display:block;margin-left:-${cX}px;margin-top:-${cY}px;max-width:none;`,
            }]]
        }

        return ['img', {
            ...HTMLAttributes,
            'data-align': align,
            'data-width': w,
            'data-height': h ?? '',
            width: w,
            style: `width:${w}px;height:${h ? h + 'px' : 'auto'};display:block;border-radius:6px;${marginStyle}`,
        }]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView)
    },
})

function ToolbarButton({ active, disabled, onClick, children, title }) {
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
    minimal = false,
}) {
    const editor = useEditor({
        immediatelyRender: false,
        editable: !readOnly,
        extensions: [
            StarterKit.configure({
                heading: minimal ? false : { levels: [1, 2, 3] },
                codeBlock: minimal ? false : { HTMLAttributes: { class: 'rounded-md bg-muted p-3' } },
            }),
            Underline,
            ...(minimal ? [] : [Highlight]),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: { class: 'underline underline-offset-4' },
            }),
            ...(minimal ? [] : [
                ResizableImage,
                ImageUpload.configure({ maxFiles: 3, maxSizeMB: 5 }),
                Columns,
                Column,
                ParagraphSpacing,
            ]),
            TextAlign.configure({
                types: minimal
                    ? ['paragraph']
                    : ['heading', 'paragraph', 'listItem'],
            }),
        ],
        content: initialHtml,
        editorProps: {
            attributes: {
                class: cn(
                    minimal ? 'min-h-[80px]' : 'min-h-[240px]',
                    'w-full rounded-md border bg-background p-4 outline-none',
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

    const applyAlign = React.useCallback(
        (align) => {
            if (!editor) return
            const chain = editor.chain().focus()

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
            if (editor.isActive('image')) return editor.isActive('image', { align })
            return editor.isActive({ textAlign: align })
        },
        [editor]
    )

    if (!editor) return null

    return (
        <div className={cn('w-full', className)}>
            {/* Toolbar */}
            <div className="sticky top-0 z-10 mb-2 flex flex-wrap items-center gap-1 rounded-md border bg-background p-2 shadow-sm">
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
                    title="Link"
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    <Link2 className="h-4 w-4" />
                </ToolbarButton>

                {!minimal && (
                    <>
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
                    </>
                )}

                <Separator orientation="vertical" className="mx-1 h-6" />

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

                {!minimal && (
                    <>
                        <Separator orientation="vertical" className="mx-1 h-6" />

                        <select
                            title="Espaçamento entre parágrafos"
                            value={editor.getAttributes('paragraph').spacing ?? ''}
                            onChange={e => editor.chain().focus().setParagraphSpacingAll(e.target.value || null).run()}
                            className="h-9 cursor-pointer rounded-md border border-input bg-background px-2 text-sm"
                        >
                            <option value="">↕ Padrão</option>
                            <option value="0rem">↕ Sem espaço</option>
                            <option value="0.5rem">↕ Compacto</option>
                            <option value="1.5rem">↕ Médio</option>
                            <option value="2.5rem">↕ Espaçado</option>
                            <option value="4rem">↕ Largo</option>
                        </select>

                        <Separator orientation="vertical" className="mx-1 h-6" />

                        <ToolbarButton
                            title="Inserir upload de imagem"
                            onClick={() => editor.chain().focus().insertImageUpload().run()}
                        >
                            <ImagePlus className="h-4 w-4" />
                        </ToolbarButton>

                        <ToolbarButton
                            title="Inserir layout de 2 colunas"
                            active={editor.isActive('columns')}
                            onClick={() => editor.chain().focus().insertColumns().run()}
                        >
                            <Columns2 className="h-4 w-4" />
                        </ToolbarButton>
                    </>
                )}

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

            {minimal ? (
                <EditorContent editor={editor} />
            ) : (
                <div className="relative rounded-sm bg-muted/30 p-2">
                    <div className="max-w-[850px] mx-auto">
                        <EditorContent editor={editor} />
                    </div>
                    <span className="pointer-events-none select-none absolute bottom-3 right-3 text-[10px] text-muted-foreground/50">
                        largura da página: 850px
                    </span>
                </div>
            )}
        </div>
    )
}
