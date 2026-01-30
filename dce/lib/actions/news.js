'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { email, z } from "zod"
import { News } from "../../models/news"
import mongoose from "mongoose"

const newsSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    excerpt: z.string().optional(),
    content: z.object({
        html: z.string().min(1),
        json: z.coerce.string(),
    }),
    status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
})

export async function upsertNews(form) {

    console.log(form)

    const session = await auth()
    if (!session) redirect("/login")

    const parsed = newsSchema.safeParse(form)
    if (!parsed.success) { return { success: false, message: "Zod falhou!" } }

    const { _id, title, excerpt, content, status } = parsed.data

    const id = _id === undefined ? new mongoose.Types.ObjectId() : new mongoose.Types.ObjectId(_id)

    const newItem = {
        _id: id,
        title,
        excerpt,
        contentHtml: content.html,
        contentJson: content.json,
        author: {
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.image
        },
        publishedAt: new Date(),
        status,
    }

    console.log(newItem);

    try {
        await News.findOneAndUpdate(
            { _id: id },
            { $set: newItem },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        )

        return { success: true, message: "Artigo publicado com sucesso." }
    } catch (err) {
        console.error("Erro ao publicar o artigo:", err)
        return { success: false, message: "Erro ao publicar o artigo." }
    }
}

export async function deleteNews(newsId) {
    try {
        await News.deleteOne({ _id: newsId })
        return { success: true, message: "Notícia deletada com sucesso." }
    } catch {
        return { success: false, message: "Erro ao deletar a notícia." }
    }
}