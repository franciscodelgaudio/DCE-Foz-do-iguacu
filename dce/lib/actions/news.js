'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { News } from "../../models/news"

const newsSchema = z.object({
    title: z.string().min(5).max(150),
    slug: z.string().min(5).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().max(400).optional(),
    contentHtml: z.string().min(20),
    contentJson: z.unknown(),
})

// aceita objeto OU FormData (pra você poder usar <form action={upsertNews}>)
function toPlainObject(input) {
    // "duck typing" de FormData
    const isFormData =
        input &&
        typeof input === "object" &&
        typeof input.entries === "function" &&
        typeof input.get === "function"

    if (!isFormData) return input

    const fd = input
    const obj = Object.fromEntries(fd.entries())

    // se contentJson vier como string, tenta parsear
    if (typeof obj.contentJson === "string") {
        try {
            obj.contentJson = JSON.parse(obj.contentJson)
        } catch {
            // deixa como string se não for JSON válido
        }
    }

    return obj
}

export async function upsertNews(input) {
    console.log(input);

    const session = await auth()
    if (!session) redirect("/login")

    const raw = toPlainObject(input)

    const parsed = newsSchema.safeParse(raw)
    if (!parsed.success) {
        return { success: false, message: "Dados inválidos", issues: parsed.error.flatten() }
    }

    const { title, slug, excerpt, contentHtml, contentJson } = parsed.data

    try {
        const doc = await News.findOneAndUpdate(
            { slug }, // ✅ filtro correto
            { $set: { title, slug, excerpt, contentHtml, contentJson } },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        )

        return { success: true, message: "Artigo publicado com sucesso.", id: String(doc?._id) }
    } catch (err) {
        console.error("Erro ao publicar artigo:", err)

        // erro comum: slug unique duplicado
        if (err?.code === 11000) {
            return { success: false, message: "Slug já existe. Escolha outro." }
        }
        return { success: false, message: "Erro ao publicar o artigo." }
    }
}
