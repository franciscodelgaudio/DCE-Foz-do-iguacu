'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { News } from "../../models/news"
import mongoose from "mongoose"
import { stat } from "fs"

const newsSchema = z.object({
    title: z.string().min(5).max(150),
    excerpt: z.string().max(400).optional(),
    contentHtml: z.string().min(20),
    contentJson: z.unknown(),
    status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
})

export async function upsertNews(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = newsSchema.safeParse(form)
    if (!parsed.success) {
        return { success: false, message: "Zod falhou!" }
    }

    const { title, excerpt, contentHtml, contentJson, status } = parsed.data

    const newItem = {
        title,
        excerpt,
        contentHtml,
        contentJson,
        author: {
            id: session.user.id,
            name: session.user.name,
            avatarUrl: session.user.image
        },
        publishedAt: new Date(),
        status,
    }

    try {
        await News.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(form._id) },
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
        return { success: false, message: "Erro ao publicar o artigo." }
    }
}
