'use server'

import mongoose from "mongoose"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { EventRegistration } from "@/models/eventRegistration"
import { Event } from "@/models/event"

export async function submitRegistration(eventId, answers) {
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

    for (const field of formFields) {
        if (field.required) {
            const ans = answers.find((a) => a.key === field.key)
            const val = ans?.value
            if (val === undefined || val === null || val === "" || val === false) {
                return { success: false, message: `O campo "${field.label}" é obrigatório.` }
            }
        }
    }

    const count = await EventRegistration.countDocuments({ eventId })
    const registrationNumber = `INS-${String(count + 1).padStart(3, "0")}`

    try {
        await EventRegistration.create({
            eventId,
            registrationNumber,
            answers,
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
