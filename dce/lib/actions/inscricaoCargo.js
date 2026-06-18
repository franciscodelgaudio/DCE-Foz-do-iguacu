'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { InscricaoCargo } from "@/models/inscricaoCargo"
import mongoose from "mongoose"
import { getRequestIp, verifyTurnstile } from "@/lib/security"

const inscricaoSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    course: z.string().min(2, "Informe seu curso"),
    semester: z.string().min(1, "Informe seu semestre"),
    cargo: z.string().min(1, "Selecione um cargo de interesse"),
    motivation: z.string().min(30, "Motivação deve ter ao menos 30 caracteres"),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
})

const statusSchema = z.object({
    id: z.string(),
    status: z.enum(["pendente", "em_analise", "aprovado", "rejeitado"]),
})

async function isRateLimited({ email, ipAddress }) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const checks = [
        InscricaoCargo.countDocuments({ email: email.toLowerCase(), createdAt: { $gte: since } }),
    ]
    if (ipAddress) {
        checks.push(InscricaoCargo.countDocuments({ ipAddress, createdAt: { $gte: since } }))
    }

    const [emailCount, ipCount = 0] = await Promise.all(checks)
    return emailCount >= 2 || ipCount >= 3
}

export async function submitInscricaoCargo(form) {
    const parsed = inscricaoSchema.safeParse(form)
    if (!parsed.success) {
        return {
            success: false,
            message: "Verifique os campos e tente novamente.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { name, email, course, semester, cargo, motivation, turnstileToken, website } = parsed.data

    try {
        const ipAddress = await getRequestIp()

        if (website) {
            return { success: false, message: "Não foi possível enviar a inscrição." }
        }

        const captchaVerified = await verifyTurnstile(turnstileToken, ipAddress)
        if (!captchaVerified) {
            return { success: false, message: "Confirme que você não é um robô e tente novamente." }
        }

        const rateLimited = await isRateLimited({ email, ipAddress })
        if (rateLimited) {
            return { success: false, message: "Você já enviou uma inscrição recentemente. Tente novamente mais tarde." }
        }

        await InscricaoCargo.create({
            name,
            email: email.toLowerCase(),
            course,
            semester,
            cargo,
            motivation,
            ipAddress,
        })

        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend")
                const resend = new Resend(process.env.RESEND_API_KEY)
                await resend.emails.send({
                    from: "DCE UNIOESTE <no-reply@dceunioestefoz.com.br>",
                    to: "foz.dce@unioeste.br",
                    subject: `[Inscrição de Cargo] ${name} — ${cargo}`,
                    html: `
                        <h2>Nova inscrição de cargo recebida</h2>
                        <p><strong>Nome:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Curso:</strong> ${course}</p>
                        <p><strong>Semestre:</strong> ${semester}</p>
                        <p><strong>Cargo de interesse:</strong> ${cargo}</p>
                        <p><strong>Motivação:</strong></p>
                        <p>${motivation.replace(/\n/g, "<br>")}</p>
                        <hr />
                        <p><strong>IP:</strong> ${ipAddress || "não identificado"}</p>
                    `,
                })
            } catch (emailErr) {
                console.error("Erro ao enviar email de inscrição:", emailErr)
            }
        }

        return { success: true, message: "Inscrição enviada com sucesso! Entraremos em contato em breve." }
    } catch (err) {
        console.error("Erro ao salvar inscrição de cargo:", err)
        return { success: false, message: "Erro ao enviar inscrição. Tente novamente." }
    }
}

async function requireSession() {
    const session = await auth()
    if (!session) redirect("/login")
    return session
}

export async function updateInscricaoStatus(form) {
    await requireSession()

    const parsed = statusSchema.safeParse(form)
    if (!parsed.success || !mongoose.Types.ObjectId.isValid(parsed.data.id)) {
        return { success: false, message: "Dados inválidos." }
    }

    await InscricaoCargo.findByIdAndUpdate(parsed.data.id, { status: parsed.data.status })
    return { success: true, message: "Status atualizado." }
}

export async function deleteInscricao(id) {
    await requireSession()

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, message: "ID inválido." }
    }

    await InscricaoCargo.findByIdAndDelete(id)
    return { success: true, message: "Inscrição removida." }
}

export async function deleteManyInscricoes(ids) {
    await requireSession()

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) return { success: false, message: "Nenhum ID válido." }

    await InscricaoCargo.deleteMany({ _id: { $in: validIds } })
    return { success: true, message: `${validIds.length} inscrição(ões) removida(s).` }
}
