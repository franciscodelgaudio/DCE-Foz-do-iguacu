'use server'

import mongoose from "mongoose"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { EventRegistration } from "@/models/eventRegistration"
import { Event } from "@/models/event"
import { getRequestIp, verifyTurnstile } from "@/lib/security"

const ACADEMIC_EMAIL_KEY = "academicEmail"
const ACADEMIC_EMAIL_LABEL = "E-mail academico"
const ACADEMIC_EMAIL_DOMAIN = "@unioeste.br"

function normalizeAcademicEmail(value) {
    return String(value ?? "").trim().toLowerCase()
}

function isValidAcademicEmail(email) {
    return /^[^\s@]+@unioeste\.br$/i.test(email)
}

function requireAdmin(session) {
    return session?.user?.role === "admin"
}

export async function submitRegistration(eventId, answers, turnstileToken) {
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
    const ipAddress = await getRequestIp()

    const captchaVerified = await verifyTurnstile(turnstileToken, ipAddress)
    if (!captchaVerified) {
        return { success: false, message: "Confirme que voce nao e um robo e tente novamente." }
    }

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

    if (ipAddress) {
        const recentFromIp = await EventRegistration.countDocuments({
            eventId,
            ipAddress,
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
        })
        if (recentFromIp >= 5) {
            return { success: false, message: "Muitas inscricoes em pouco tempo. Tente novamente mais tarde." }
        }
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
            ipAddress,
            paymentStatus: requiresPayment ? "pending" : "not_required",
        })
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

export async function confirmRegistrationEntry(registrationId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
        return { success: false, message: "ID invalido." }
    }

    try {
        const registration = await EventRegistration.findById(registrationId)
        if (!registration) return { success: false, message: "Inscricao nao encontrada." }

        if (registration.entryConfirmedAt) {
            return { success: true, message: "Entrada ja estava confirmada." }
        }

        registration.entryConfirmedAt = new Date()
        await registration.save()

        return { success: true, message: "Entrada confirmada!" }
    } catch {
        return { success: false, message: "Erro ao confirmar entrada." }
    }
}

export async function deleteRegistration(registrationId) {
    const session = await auth()
    if (!session) redirect("/login")
    if (!requireAdmin(session)) {
        return { success: false, message: "Apenas administradores podem excluir inscricoes." }
    }

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
    if (!requireAdmin(session)) {
        return { success: false, message: "Apenas administradores podem excluir inscricoes." }
    }

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

export async function updateRegistration(registrationId, answers) {
    const session = await auth()
    if (!session) redirect("/login")
    if (!requireAdmin(session)) {
        return { success: false, message: "Apenas administradores podem editar inscricoes." }
    }

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
        return { success: false, message: "ID invalido." }
    }

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
        return { success: false, message: "Informe o e-mail academico." }
    }

    if (!isValidAcademicEmail(academicEmail)) {
        return { success: false, message: `Use um e-mail academico que termine em ${ACADEMIC_EMAIL_DOMAIN}.` }
    }

    try {
        const registration = await EventRegistration.findById(registrationId)
        if (!registration) return { success: false, message: "Inscricao nao encontrada." }

        const duplicate = await EventRegistration.exists({
            _id: { $ne: registration._id },
            eventId: registration.eventId,
            academicEmail,
        })
        if (duplicate) {
            return { success: false, message: "Este e-mail academico ja esta em outra inscricao deste evento." }
        }

        registration.academicEmail = academicEmail
        registration.answers = normalizedAnswers
        await registration.save()

        return { success: true, message: "Inscricao atualizada." }
    } catch {
        return { success: false, message: "Erro ao atualizar inscricao." }
    }
}
