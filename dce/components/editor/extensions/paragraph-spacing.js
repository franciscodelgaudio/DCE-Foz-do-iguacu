import { Extension } from '@tiptap/core'

export const ParagraphSpacing = Extension.create({
    name: 'paragraphSpacing',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph'],
                attributes: {
                    spacing: {
                        default: null,
                        parseHTML: el => el.style.marginBottom || null,
                        renderHTML: attrs => attrs.spacing != null
                            ? { style: `margin-top:${attrs.spacing};margin-bottom:${attrs.spacing}` }
                            : {},
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setParagraphSpacing: spacing => ({ commands }) =>
                commands.updateAttributes('paragraph', { spacing: spacing || null }),

            // Applies spacing to every paragraph in the document
            setParagraphSpacingAll: spacing => ({ tr, state, dispatch }) => {
                state.doc.descendants((node, pos) => {
                    if (node.type.name === 'paragraph') {
                        tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            spacing: spacing || null,
                        })
                    }
                })
                if (dispatch) dispatch(tr)
                return true
            },
        }
    },
})
