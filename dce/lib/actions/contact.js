'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Contact } from "@/models/contact"
import mongoose from "mongoose"

const contactSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    subject: z.string().min(1, "Assunto é obrigatório"),
    message: z.string().min(10, "Mensagem deve ter ao menos 10 caracteres"),
})

export async function sendContactMessage(form) {
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
        return {
            success: false,
            message: "Verifique os campos e tente novamente.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { name, email, subject, message } = parsed.data

    try {
        await Contact.create({ name, email, subject, message })

        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend")
                const resend = new Resend(process.env.RESEND_API_KEY)
                const emailResult = await resend.emails.send({
                    from: "DCE UNIOESTE <no-reply@dceunioestefoz.com.br>",
                    to: "foz.dce@unioeste.br",
                    subject: `[Contato] ${subject}`,
                    html: `
                        <h2>Nova mensagem de contato</h2>
                        <p><strong>Nome:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Assunto:</strong> ${subject}</p>
                        <p><strong>Mensagem:</strong></p>
                        <p>${message.replace(/\n/g, "<br>")}</p>
                    `,
                })
                if (emailResult?.error) {
                    console.error("Resend retornou erro:", emailResult.error)
                }
            } catch (emailErr) {
                console.error("Erro ao enviar email:", emailErr)
            }
        }

        return { success: true, message: "Mensagem enviada com sucesso! Entraremos em contato em breve." }
    } catch (err) {
        console.error("Erro ao salvar mensagem de contato:", err)
        return { success: false, message: "Erro ao enviar mensagem. Tente novamente." }
    }
}

const statusSchema = z.object({
    id: z.string(),
    status: z.enum(["unread", "read", "replied"]),
})

async function requireSession() {
    const session = await auth()
    if (!session) redirect("/login")
    return session
}

export async function updateContactStatus(form) {
    await requireSession()

    const parsed = statusSchema.safeParse(form)
    if (!parsed.success || !mongoose.Types.ObjectId.isValid(parsed.data.id)) {
        return { success: false, message: "Dados inválidos." }
    }

    await Contact.findByIdAndUpdate(parsed.data.id, { status: parsed.data.status })
    return { success: true, message: "Mensagem atualizada." }
}

export async function deleteContactMessage(id) {
    await requireSession()

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, message: "ID inválido." }
    }

    await Contact.findByIdAndDelete(id)
    return { success: true, message: "Mensagem removida." }
}

export async function deleteManyContactMessages(ids) {
    await requireSession()

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) return { success: false, message: "Nenhum ID válido." }

    await Contact.deleteMany({ _id: { $in: validIds } })
    return { success: true, message: `${validIds.length} mensagem(ns) removida(s).` }
}
