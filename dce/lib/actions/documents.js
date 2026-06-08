'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Document } from "../../models/document"
import mongoose from "mongoose"

const documentSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    type: z.enum(["edital", "ata", "posse"]),
    description: z.string().optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
})

export async function upsertDocument(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = documentSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    const { _id, title, type, description, fileUrl, fileName, date, status } = parsed.data

    const isAdmin = session.user?.role === "admin"
    if (status === "published" && !isAdmin) {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    const id = _id === undefined
        ? new mongoose.Types.ObjectId()
        : new mongoose.Types.ObjectId(_id)

    const dateFields = {}
    if (status === "published") {
        dateFields.publishedAt = new Date()
    }

    const newItem = {
        _id: id,
        title,
        type,
        description,
        fileUrl,
        fileName,
        date: date ? new Date(date) : undefined,
        status: status ?? "draft",
        author: {
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.image,
        },
        ...dateFields,
    }

    try {
        await Document.findOneAndUpdate(
            { _id: id },
            { $set: newItem },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        )
        return { success: true, message: "Documento salvo com sucesso." }
    } catch (err) {
        console.error("Erro ao salvar documento:", err)
        return { success: false, message: "Erro ao salvar documento." }
    }
}

export async function publishDocument(documentId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem publicar conteúdo." }
    }

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await Document.findByIdAndUpdate(documentId, {
            $set: { status: "published", publishedAt: new Date() },
        })
        return { success: true, message: "Documento publicado com sucesso." }
    } catch (err) {
        console.error("Erro ao publicar documento:", err)
        return { success: false, message: "Erro ao publicar documento." }
    }
}

export async function deleteDocument(documentId) {
    const session = await auth()
    if (!session) redirect("/login")

    try {
        await Document.deleteOne({ _id: documentId })
        return { success: true, message: "Documento deletado com sucesso." }
    } catch {
        return { success: false, message: "Erro ao deletar o documento." }
    }
}

export async function deleteManyDocuments(documentIds) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return { success: false, message: "Nenhum documento selecionado." }
    }

    const ids = documentIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))

    if (!ids.length) {
        return { success: false, message: "Nenhum documento válido selecionado." }
    }

    try {
        const result = await Document.deleteMany({ _id: { $in: ids } })
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} documento(s) deletado(s) com sucesso.`,
        }
    } catch {
        return { success: false, message: "Erro ao deletar os documentos." }
    }
}
