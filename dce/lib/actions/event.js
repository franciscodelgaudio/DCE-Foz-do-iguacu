'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Event } from "../../models/event"
import mongoose from "mongoose"

const eventSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    excerpt: z.string().optional(),
    location: z.string().optional(),
    eventDate: z.string().optional(),
    eventEndDate: z.string().optional(),
    content: z.object({
        html: z.string().min(1),
        json: z.coerce.string(),
    }),
    status: z.enum(["draft", "published", "archived"]).optional(),
})

export async function upsertEvent(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = eventSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    const { _id, title, excerpt, location, eventDate, eventEndDate, content, status } = parsed.data

    const id = _id ? new mongoose.Types.ObjectId(_id) : new mongoose.Types.ObjectId()

    const item = {
        _id: id,
        title,
        excerpt: excerpt ?? "",
        location: location ?? "",
        contentHtml: content.html,
        contentJson: content.json,
        author: {
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.image,
        },
        status,
        ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
        ...(eventEndDate ? { eventEndDate: new Date(eventEndDate) } : { eventEndDate: null }),
        ...(status === "published" ? { publishedAt: new Date() } : {}),
    }

    try {
        await Event.findOneAndUpdate(
            { _id: id },
            { $set: item },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        )
        return { success: true, message: "Evento salvo com sucesso." }
    } catch (err) {
        console.error("Erro ao salvar o evento:", err)
        return { success: false, message: "Erro ao salvar o evento." }
    }
}

export async function deleteEvent(eventId) {
    try {
        await Event.deleteOne({ _id: eventId })
        return { success: true, message: "Evento deletado com sucesso." }
    } catch {
        return { success: false, message: "Erro ao deletar o evento." }
    }
}

export async function deleteManyEvents(eventIds) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
        return { success: false, message: "Nenhum evento selecionado." }
    }

    const ids = eventIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))

    if (!ids.length) return { success: false, message: "Nenhum evento válido selecionado." }

    try {
        const result = await Event.deleteMany({ _id: { $in: ids } })
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} evento(s) deletado(s) com sucesso.`,
        }
    } catch {
        return { success: false, message: "Erro ao deletar os eventos." }
    }
}

export async function incrementEventViewCount(eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) return
    await Event.findByIdAndUpdate(eventId, { $inc: { viewCount: 1 } })
}
