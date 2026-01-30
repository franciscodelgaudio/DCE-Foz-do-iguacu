'use client'

import { useState } from "react"
import Tiptap from "../../ui/Tiptap"
import { upsertNews } from "@/lib/actions/news" // ajuste o path

export function Display() {
    const [content, setContent] = useState({ html: "", json: null })

    return (
        <form action={upsertNews} className="space-y-4">
            {/* aqui você coloca seus inputs de title/slug/excerpt */}
            <input name="title" placeholder="Título" className="border p-2 w-full" />
            <input name="slug" placeholder="slug-exemplo" className="border p-2 w-full" />
            <input name="excerpt" placeholder="Resumo" className="border p-2 w-full" />

            {/* Tiptap controla o conteúdo */}
            <Tiptap
                onChange={({ html, json }) => setContent({ html, json })}
            />

            {/* manda pro server action */}
            <input type="hidden" name="contentHtml" value={content.html} />
            <input type="hidden" name="contentJson" value={JSON.stringify(content.json ?? {})} />

            <button type="submit" className="border px-4 py-2">Publicar</button>
        </form>
    )
}
