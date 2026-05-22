import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Trash2 } from 'lucide-react'

function ColumnView() {
    return (
        <NodeViewWrapper
            data-type="column"
            style={{
                flex: 1,
                minWidth: 0,
                border: '1px dashed #cbd5e1',
                borderRadius: 4,
                padding: '4px 8px',
            }}
        >
            <NodeViewContent />
        </NodeViewWrapper>
    )
}

function ColumnsView({ deleteNode }) {
    return (
        <NodeViewWrapper data-type="columns" style={{ position: 'relative', margin: '8px 0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <NodeViewContent />
            </div>
            <button
                contentEditable={false}
                onClick={deleteNode}
                title="Remover colunas"
                style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 10,
                }}
            >
                <Trash2 size={12} color="#ef4444" />
            </button>
        </NodeViewWrapper>
    )
}

export const Column = Node.create({
    name: 'column',
    group: 'block',
    content: 'block+',
    isolating: true,
    parseHTML() {
        return [{ tag: 'div[data-type="column"]' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'column',
            style: 'flex:1;min-width:0',
        }), 0]
    },
    addNodeView() {
        return ReactNodeViewRenderer(ColumnView)
    },
})

export const Columns = Node.create({
    name: 'columns',
    group: 'block',
    content: 'column column',
    parseHTML() {
        return [{ tag: 'div[data-type="columns"]' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'columns',
            style: 'display:flex;gap:1.5rem;align-items:flex-start',
        }), 0]
    },
    addNodeView() {
        return ReactNodeViewRenderer(ColumnsView)
    },
    addCommands() {
        return {
            insertColumns: () => ({ commands }) =>
                commands.insertContent({
                    type: 'columns',
                    content: [
                        { type: 'column', content: [{ type: 'paragraph' }] },
                        { type: 'column', content: [{ type: 'paragraph' }] },
                    ],
                }),
        }
    },
})
