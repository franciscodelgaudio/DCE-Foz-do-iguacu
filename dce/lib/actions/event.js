'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Event } from "../../models/event"
import mongoose from "mongoose"

const formFieldInputSchema = z.object({
    key: z.string(),
    label: z.string().min(1),
    type: z.enum(["text", "email", "tel", "number", "select", "textarea", "checkbox"]),
    required: z.boolean().default(false),
    optionsText: z.string().optional().default(""),
})

const registrationInputSchema = z.object({
    enabled: z.boolean().default(false),
    deadline: z.string().optional(),
    limit: z.preprocess(
        (v) => (v === "" || v == null ? undefined : Number(v)),
        z.number().positive().optional()
    ),
    requiresPayment: z.boolean().default(false),
    paymentAmount: z.preprocess(
        (v) => (v === "" || v == null ? undefined : Number(v)),
        z.number().positive().optional()
    ),
    pixKey: z.string().optional(),
    pixKeyType: z.enum(["email", "phone", "cpf", "random"]).optional(),
    pixRecipientName: z.string().optional(),
    formFields: z.array(formFieldInputSchema).default([]),
}).optional()

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
    registration: registrationInputSchema,
})

export async function upsertEvent(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = eventSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    const { _id, title, excerpt, location, eventDate, eventEndDate, content, status, registration } = parsed.data

    const isAdmin = session.user?.role === "admin"
    if (status === "published" && !isAdmin) {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    const id = _id ? new mongoose.Types.ObjectId(_id) : new mongoose.Types.ObjectId()

    const processedRegistration = registration
        ? {
              enabled: registration.enabled,
              deadline: registration.deadline ? new Date(registration.deadline) : undefined,
              limit: registration.limit,
              requiresPayment: registration.requiresPayment,
              paymentAmount: registration.paymentAmount,
              pixKey: registration.pixKey ?? "",
              pixKeyType: registration.pixKeyType,
              pixRecipientName: registration.pixRecipientName ?? "",
              formFields: registration.formFields.map((f, i) => ({
                  key: f.key || `field_${Date.now()}_${i}`,
                  label: f.label,
                  type: f.type,
                  required: f.required,
                  options: f.optionsText
                      ? f.optionsText
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean)
                      : [],
                  order: i,
              })),
          }
        : undefined

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
        ...(processedRegistration !== undefined ? { registration: processedRegistration } : {}),
    }

    try {
        await Event.findOneAndUpdate(
            { _id: id },
            { $set: item },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        )
        revalidatePath('/dashboard/events')
        revalidatePath(`/dashboard/events/${id.toString()}`)
        revalidatePath(`/home/events/${id.toString()}`)
        return { success: true, message: "Evento salvo com sucesso." }
    } catch (err) {
        console.error("Erro ao salvar o evento:", err)
        return { success: false, message: "Erro ao salvar o evento." }
    }
}

export async function publishEvent(eventId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await Event.findByIdAndUpdate(eventId, {
            $set: { status: "published", publishedAt: new Date() },
        })
        return { success: true, message: "Evento publicado com sucesso." }
    } catch (err) {
        console.error("Erro ao publicar o evento:", err)
        return { success: false, message: "Erro ao publicar o evento." }
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
