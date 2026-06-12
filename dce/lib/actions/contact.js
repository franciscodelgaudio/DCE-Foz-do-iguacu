'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Contact } from "@/models/contact"
import mongoose from "mongoose"
import { getRequestIp, verifyTurnstile } from "@/lib/security"

const contactSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email invalido"),
    subject: z.string().min(1, "Assunto e obrigatorio"),
    message: z.string().min(10, "Mensagem deve ter ao menos 10 caracteres"),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
})

const statusSchema = z.object({
    id: z.string(),
    status: z.enum(["unread", "read", "replied"]),
})

async function isRateLimited({ email, message, ipAddress }) {
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const sameMessageWindow = new Date(Date.now() - 60 * 60 * 1000)
    const checks = [
        Contact.countDocuments({ email: email.toLowerCase(), createdAt: { $gte: since } }),
        Contact.countDocuments({ message, createdAt: { $gte: sameMessageWindow } }),
    ]
    if (ipAddress) {
        checks.push(Contact.countDocuments({ ipAddress, createdAt: { $gte: since } }))
    }

    const [emailCount, messageCount, ipCount = 0] = await Promise.all(checks)
    return emailCount >= 3 || messageCount >= 3 || ipCount >= 5
}

export async function sendContactMessage(form) {
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
        return {
            success: false,
            message: "Verifique os campos e tente novamente.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { name, email, subject, message, turnstileToken, website } = parsed.data

    try {
        const ipAddress = await getRequestIp()

        if (website) {
            return { success: false, message: "Nao foi possivel enviar a mensagem." }
        }

        const captchaVerified = await verifyTurnstile(turnstileToken, ipAddress)
        if (!captchaVerified) {
            return { success: false, message: "Confirme que voce nao e um robo e tente novamente." }
        }

        const rateLimited = await isRateLimited({ email, message, ipAddress })
        if (rateLimited) {
            return { success: false, message: "Muitas mensagens em pouco tempo. Tente novamente mais tarde." }
        }

        await Contact.create({
            name,
            email: email.toLowerCase(),
            subject,
            message,
            ipAddress,
        })

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
                        <hr />
                        <p><strong>IP:</strong> ${ipAddress || "nao identificado"}</p>
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

async function requireSession() {
    const session = await auth()
    if (!session) redirect("/login")
    return session
}

export async function updateContactStatus(form) {
    await requireSession()

    const parsed = statusSchema.safeParse(form)
    if (!parsed.success || !mongoose.Types.ObjectId.isValid(parsed.data.id)) {
        return { success: false, message: "Dados invalidos." }
    }

    await Contact.findByIdAndUpdate(parsed.data.id, { status: parsed.data.status })
    return { success: true, message: "Mensagem atualizada." }
}

export async function deleteContactMessage(id) {
    await requireSession()

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, message: "ID invalido." }
    }

    await Contact.findByIdAndDelete(id)
    return { success: true, message: "Mensagem removida." }
}

export async function deleteManyContactMessages(ids) {
    await requireSession()

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) return { success: false, message: "Nenhum ID valido." }

    await Contact.deleteMany({ _id: { $in: validIds } })
    return { success: true, message: `${validIds.length} mensagem(ns) removida(s).` }
}
