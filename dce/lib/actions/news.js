'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { News } from "../../models/news"
import mongoose from "mongoose"

const COORDINATION_KEYS = ["comunicacao", "cultura", "integracao", "ensino", "movimento", "assistencia", "diversidade", "presidencia"]

const newsSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    excerpt: z.string().optional(),
    content: z.object({
        html: z.string().min(1),
        json: z.coerce.string(),
    }),
    status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
    scheduledAt: z.string().optional(),
    coordination: z.enum(COORDINATION_KEYS).nullable().optional(),
})

export async function upsertNews(form) {

    console.log(form)

    const session = await auth()
    if (!session) redirect("/login")

    const parsed = newsSchema.safeParse(form)
    if (!parsed.success) { return { success: false, message: "Zod falhou!" } }

    const { _id, title, excerpt, content, status, scheduledAt, coordination } = parsed.data

    const isAdmin = session.user?.role === "admin"
    if ((status === "published" || status === "scheduled") && !isAdmin) {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    const id = _id === undefined ? new mongoose.Types.ObjectId() : new mongoose.Types.ObjectId(_id)

    const dateFields = {}
    if (status === 'published') {
        dateFields.publishedAt = new Date()
        dateFields.scheduledAt = null
    } else if (status === 'scheduled' && scheduledAt) {
        dateFields.scheduledAt = new Date(scheduledAt)
        dateFields.publishedAt = null
    }

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
        coordination: coordination ?? null,
        status,
        ...dateFields,
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

export async function publishNews(newsId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    if (!mongoose.Types.ObjectId.isValid(newsId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await News.findByIdAndUpdate(newsId, {
            $set: { status: "published", publishedAt: new Date(), scheduledAt: null },
        })
        return { success: true, message: "Artigo publicado com sucesso." }
    } catch (err) {
        console.error("Erro ao publicar o artigo:", err)
        return { success: false, message: "Erro ao publicar o artigo." }
    }
}

export async function setFeaturedNews(newsId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem definir o destaque." }
    }

    if (!mongoose.Types.ObjectId.isValid(newsId)) {
        return { success: false, message: "ID inválido." }
    }

    const id = new mongoose.Types.ObjectId(newsId)
    const newsItem = await News.findById(id).select("status").lean()
    if (!newsItem) {
        return { success: false, message: "Artigo não encontrado." }
    }

    if (newsItem.status !== "published") {
        return { success: false, message: "Apenas artigos publicados podem entrar em destaque." }
    }

    try {
        await News.updateMany({ _id: { $ne: id } }, { $set: { featured: false } })
        await News.findByIdAndUpdate(id, { $set: { featured: true } })
        return { success: true, message: "Artigo definido como destaque da página inicial." }
    } catch (err) {
        console.error("Erro ao definir destaque:", err)
        return { success: false, message: "Erro ao definir o destaque." }
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

export async function incrementViewCount(newsId) {
    if (!mongoose.Types.ObjectId.isValid(newsId)) return
    await News.findByIdAndUpdate(newsId, { $inc: { viewCount: 1 } })
}

export async function deleteManyNews(newsIds) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!Array.isArray(newsIds) || newsIds.length === 0) {
        return { success: false, message: "Nenhuma notícia selecionada." }
    }

    const ids = newsIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))

    if (!ids.length) {
        return { success: false, message: "Nenhuma notícia válida selecionada." }
    }

    try {
        const result = await News.deleteMany({ _id: { $in: ids } })
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} notícia(s) deletada(s) com sucesso.`,
        }
    } catch {
        return { success: false, message: "Erro ao deletar as notícias." }
    }
}
