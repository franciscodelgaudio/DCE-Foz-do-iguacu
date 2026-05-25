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
                        renderHTML: attrs => attrs.spacing
                            ? { style: `margin-bottom:${attrs.spacing}` }
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
        }
    },
})
