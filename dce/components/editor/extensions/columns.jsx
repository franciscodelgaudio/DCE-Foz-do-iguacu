import { Node, mergeAttributes } from '@tiptap/core'

export const Column = Node.create({
    name: 'column',
    group: 'block',
    content: 'block+',
    parseHTML() {
        return [{ tag: 'div[data-type="column"]' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'column',
            style: 'flex:1;min-width:0;padding:4px 8px',
        }), 0]
    },
})

function insertParagraphAfterColumns(editor) {
    const { state } = editor
    const { $from } = state.selection

    for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === 'columns') {
            const columnsStart = $from.before(d)
            const columnsNode = $from.node(d)
            const afterPos = columnsStart + columnsNode.nodeSize

            editor.chain()
                .insertContentAt(afterPos, { type: 'paragraph' })
                .setTextSelection(afterPos + 1)
                .run()

            return true
        }
    }
    return false
}

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
            style: 'display:flex;gap:1.5rem;align-items:flex-start;margin:1em 0',
        }), 0]
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Enter': ({ editor }) => {
                if (!editor.isActive('column')) return false
                return insertParagraphAfterColumns(editor)
            },
        }
    },
    addNodeView() {
        return ({ editor, getPos }) => {
            const dom = document.createElement('div')
            dom.setAttribute('data-type', 'columns')
            dom.style.cssText = 'position:relative;display:flex;gap:1.5rem;align-items:flex-start;margin:1em 0'

            const contentDOM = document.createElement('div')
            contentDOM.style.cssText = 'display:contents'
            dom.appendChild(contentDOM)

            const removeBtn = document.createElement('button')
            removeBtn.setAttribute('contenteditable', 'false')
            removeBtn.title = 'Remover colunas'
            removeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;background:#fff;border:1px solid #e2e8f0;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:10;font-size:16px;color:#ef4444;line-height:1'
            removeBtn.textContent = '×'
            removeBtn.addEventListener('mousedown', (e) => {
                e.preventDefault()
                if (typeof getPos === 'function') {
                    editor.chain().setNodeSelection(getPos()).deleteSelection().run()
                }
            })
            dom.appendChild(removeBtn)

            return { dom, contentDOM }
        }
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
