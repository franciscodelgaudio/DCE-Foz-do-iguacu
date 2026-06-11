'use server'

import mongoose from "mongoose"
import crypto from "crypto"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { EventRegistration } from "@/models/eventRegistration"
import { EventRegistrationVerification } from "@/models/eventRegistrationVerification"
import { Event } from "@/models/event"

const ACADEMIC_EMAIL_KEY = "academicEmail"
const ACADEMIC_EMAIL_LABEL = "E-mail academico"
const ACADEMIC_EMAIL_DOMAIN = "@unioeste.br"

function normalizeAcademicEmail(value) {
    return String(value ?? "").trim().toLowerCase()
}

function isValidAcademicEmail(email) {
    return /^[^\s@]+@unioeste\.br$/i.test(email)
}

function hashVerificationCode(code) {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dce-registration"
    return crypto.createHash("sha256").update(`${code}:${secret}`).digest("hex")
}

function generateVerificationCode() {
    return String(crypto.randomInt(100000, 1000000))
}

export async function requestRegistrationCode(eventId, academicEmailValue) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return { success: false, message: "Evento invalido." }
    }

    const academicEmail = normalizeAcademicEmail(academicEmailValue)

    if (!academicEmail) {
        return { success: false, message: "Informe seu e-mail academico da Unioeste." }
    }

    if (!isValidAcademicEmail(academicEmail)) {
        return { success: false, message: `Use um e-mail academico que termine em ${ACADEMIC_EMAIL_DOMAIN}.` }
    }

    const event = await Event.findById(eventId).lean()
    if (!event) return { success: false, message: "Evento nao encontrado." }
    if (!event.registration?.enabled) return { success: false, message: "Inscricoes nao estao abertas para este evento." }

    const { deadline, limit } = event.registration

    if (deadline && new Date(deadline) < new Date()) {
        return { success: false, message: "O prazo de inscricao encerrou." }
    }

    if (limit) {
        const count = await EventRegistration.countDocuments({ eventId })
        if (count >= limit) return { success: false, message: "Vagas esgotadas." }
    }

    const existingRegistration = await EventRegistration.exists({ eventId, academicEmail })
    if (existingRegistration) {
        return { success: false, message: "Este e-mail academico ja foi usado para se inscrever neste evento." }
    }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, message: "Servico de e-mail nao configurado. Fale com a organizacao do evento." }
    }

    const now = new Date()
    const currentVerification = await EventRegistrationVerification.findOne({ eventId, academicEmail }).lean()
    if (currentVerification?.sentAt && now.getTime() - new Date(currentVerification.sentAt).getTime() < 60_000) {
        return { success: false, message: "Aguarde um minuto antes de solicitar outro codigo." }
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000)

    await EventRegistrationVerification.findOneAndUpdate(
        { eventId, academicEmail },
        {
            codeHash: hashVerificationCode(code),
            attempts: 0,
            sentAt: now,
            expiresAt,
            verifiedAt: null,
            consumedAt: null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const emailResult = await resend.emails.send({
            from: "DCE UNIOESTE <no-reply@dceunioestefoz.org>",
            to: academicEmail,
            subject: `Codigo de inscricao - ${event.title ?? "Evento DCE"}`,
            html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;background:#fff;">
                    <h1 style="color:#2708ab;font-size:24px;margin-bottom:8px;">Codigo de confirmacao</h1>
                    <p style="color:#475569;font-size:15px;line-height:1.5;">
                        Use o codigo abaixo para confirmar sua inscricao em <strong>${event.title ?? "Evento DCE"}</strong>.
                    </p>
                    <p style="font-size:32px;letter-spacing:8px;font-weight:800;color:#1e293b;margin:24px 0;">${code}</p>
                    <p style="color:#64748b;font-size:13px;">Este codigo expira em 15 minutos.</p>
                </div>
            `,
        })

        if (emailResult.error) {
            console.error("[requestRegistrationCode] Resend retornou erro:", emailResult.error)
            return { success: false, message: "Erro ao enviar o codigo. Tente novamente." }
        }

        return { success: true, message: `Enviamos um codigo para ${academicEmail}.` }
    } catch (err) {
        console.error("[requestRegistrationCode] Erro ao enviar codigo:", err)
        return { success: false, message: "Erro ao enviar o codigo. Tente novamente." }
    }
}

export async function submitRegistration(eventId, answers, verificationCode) {
    if (!Array.isArray(answers)) {
        return { success: false, message: "Dados da inscricao invalidos." }
    }

    const normalizedAnswers = answers.map((answer) => ({
        key: String(answer?.key ?? ""),
        label: String(answer?.label ?? ""),
        value: answer?.value,
    }))

    const academicEmail = normalizeAcademicEmail(
        normalizedAnswers.find((answer) => answer.key === ACADEMIC_EMAIL_KEY)?.value
    )

    if (!academicEmail) {
        return { success: false, message: "Informe seu e-mail academico da Unioeste." }
    }

    if (!isValidAcademicEmail(academicEmail)) {
        return { success: false, message: `Use um e-mail academico que termine em ${ACADEMIC_EMAIL_DOMAIN}.` }
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return { success: false, message: "Evento inválido." }
    }

    const event = await Event.findById(eventId).lean()
    if (!event) return { success: false, message: "Evento não encontrado." }
    if (!event.registration?.enabled) return { success: false, message: "Inscrições não estão abertas para este evento." }

    const { deadline, limit, requiresPayment, formFields = [] } = event.registration

    if (deadline && new Date(deadline) < new Date()) {
        return { success: false, message: "O prazo de inscrição encerrou." }
    }

    if (limit) {
        const count = await EventRegistration.countDocuments({ eventId })
        if (count >= limit) return { success: false, message: "Vagas esgotadas." }
    }

    const existingRegistration = await EventRegistration.exists({ eventId, academicEmail })
    if (existingRegistration) {
        return { success: false, message: "Este e-mail academico ja foi usado para se inscrever neste evento." }
    }

    const cleanVerificationCode = String(verificationCode ?? "").replace(/\D/g, "")
    if (!/^\d{6}$/.test(cleanVerificationCode)) {
        return { success: false, message: "Informe o codigo de verificacao enviado ao seu e-mail." }
    }

    const verification = await EventRegistrationVerification.findOne({ eventId, academicEmail })
    if (!verification || verification.consumedAt || new Date(verification.expiresAt) < new Date()) {
        return { success: false, message: "Codigo expirado ou invalido. Solicite um novo codigo." }
    }

    if (verification.attempts >= 5) {
        return { success: false, message: "Muitas tentativas incorretas. Solicite um novo codigo." }
    }

    if (verification.codeHash !== hashVerificationCode(cleanVerificationCode)) {
        await EventRegistrationVerification.updateOne(
            { _id: verification._id },
            { $inc: { attempts: 1 } }
        )
        return { success: false, message: "Codigo de verificacao incorreto." }
    }

    const customAnswers = normalizedAnswers.filter((answer) => answer.key !== ACADEMIC_EMAIL_KEY)

    for (const field of formFields) {
        if (field.required) {
            const ans = customAnswers.find((a) => a.key === field.key)
            const val = ans?.value
            if (val === undefined || val === null || val === "" || val === false) {
                return { success: false, message: `O campo "${field.label}" é obrigatório.` }
            }
        }
    }

    const savedAnswers = [
        { key: ACADEMIC_EMAIL_KEY, label: ACADEMIC_EMAIL_LABEL, value: academicEmail },
        ...customAnswers,
    ]

    const count = await EventRegistration.countDocuments({ eventId })
    const registrationNumber = `INS-${String(count + 1).padStart(3, "0")}`

    try {
        await EventRegistration.create({
            eventId,
            registrationNumber,
            academicEmail,
            answers: savedAnswers,
            paymentStatus: requiresPayment ? "pending" : "not_required",
        })
        await EventRegistrationVerification.updateOne(
            { _id: verification._id },
            { verifiedAt: new Date(), consumedAt: new Date() }
        )
        return {
            success: true,
            message: "Inscrição realizada com sucesso!",
            registrationNumber,
        }
    } catch (err) {
        console.error("Erro ao criar inscrição:", err)
        return { success: false, message: "Erro ao realizar inscrição. Tente novamente." }
    }
}

export async function confirmRegistrationPayment(registrationId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await EventRegistration.findByIdAndUpdate(registrationId, {
            paymentStatus: "confirmed",
            confirmedAt: new Date(),
        })
        return { success: true, message: "Pagamento confirmado!" }
    } catch {
        return { success: false, message: "Erro ao confirmar pagamento." }
    }
}

export async function cancelRegistration(registrationId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await EventRegistration.findByIdAndUpdate(registrationId, { paymentStatus: "cancelled" })
        return { success: true, message: "Inscrição cancelada." }
    } catch {
        return { success: false, message: "Erro ao cancelar inscrição." }
    }
}

export async function deleteRegistration(registrationId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await EventRegistration.findByIdAndDelete(registrationId)
        return { success: true, message: "Inscrição deletada." }
    } catch {
        return { success: false, message: "Erro ao deletar inscrição." }
    }
}

export async function deleteManyRegistrations(registrationIds) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
        return { success: false, message: "Nenhuma inscrição selecionada." }
    }

    const ids = registrationIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))

    if (!ids.length) return { success: false, message: "Nenhuma inscrição válida selecionada." }

    try {
        const result = await EventRegistration.deleteMany({ _id: { $in: ids } })
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} inscrição(ões) deletada(s) com sucesso.`,
        }
    } catch {
        return { success: false, message: "Erro ao deletar as inscrições." }
    }
}
