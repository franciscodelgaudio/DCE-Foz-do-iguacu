'use server'

import { z } from "zod"
import mongoose from "mongoose"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CorreioElegante } from "@/models/correioElegante"

const PACKAGES = {
    cartinha: { label: "Cartinha", price: 2.5 },
    rosa: { label: "Rosa + Cartinha", price: 6.0 },
    bombom_cartinha: { label: "Bombom + Cartinha", price: 5.0 },
    bombom_cartinha_rosa: { label: "Bombom + Cartinha + Rosa", price: 8.5 },
}

const orderSchema = z.object({
    senderName: z.string().min(2, "Nome do remetente é obrigatório"),
    senderContact: z.string().min(1, "Contato é obrigatório"),
    recipientName: z.string().min(2, "Nome do destinatário é obrigatório"),
    recipientCourse: z.string().min(1, "Curso é obrigatório"),
    recipientYear: z.string().min(1, "Ano na faculdade é obrigatório"),
    package: z.enum(["cartinha", "rosa", "bombom_cartinha", "bombom_cartinha_rosa"]),
    cardMessage: z.string().max(500).optional(),
    isAnonymous: z.boolean().optional(),
})

export async function createOrder(form) {
    const parsed = orderSchema.safeParse(form)
    if (!parsed.success) {
        return {
            success: false,
            message: "Verifique os campos e tente novamente.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { senderName, senderContact, recipientName, recipientCourse, recipientYear, package: pkg, cardMessage, isAnonymous } =
        parsed.data
    const pkgInfo = PACKAGES[pkg]

    const count = await CorreioElegante.countDocuments()
    const orderNumber = `CE-${String(count + 1).padStart(3, "0")}`

    try {
        await CorreioElegante.create({
            orderNumber,
            senderName,
            senderContact,
            recipientName,
            recipientCourse,
            recipientYear,
            package: pkg,
            price: pkgInfo.price,
            cardMessage: cardMessage ?? "",
            isAnonymous: isAnonymous ?? false,
            paymentStatus: "pending",
        })
        const priceFormatted = Number(pkgInfo.price).toFixed(2).replace('.', ',')
        return {
            success: true,
            message: "Pedido realizado com sucesso!",
            orderNumber,
            price: priceFormatted,
            packageLabel: pkgInfo.label,
        }
    } catch (err) {
        console.error("Erro ao criar pedido:", err)
        return { success: false, message: "Erro ao criar o pedido. Tente novamente." }
    }
}

export async function confirmPayment(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, {
            paymentStatus: "confirmed",
            confirmedAt: new Date(),
        })
        return { success: true, message: "Pagamento confirmado!" }
    } catch {
        return { success: false, message: "Erro ao confirmar pagamento." }
    }
}

export async function cancelOrder(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, { paymentStatus: "cancelled" })
        return { success: true, message: "Pedido cancelado." }
    } catch {
        return { success: false, message: "Erro ao cancelar o pedido." }
    }
}

export async function deleteOrder(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await CorreioElegante.findByIdAndDelete(orderId)
        return { success: true, message: "Pedido deletado." }
    } catch {
        return { success: false, message: "Erro ao deletar o pedido." }
    }
}

export async function deleteManyOrders(orderIds) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return { success: false, message: "Nenhum pedido selecionado." }
    }

    const ids = orderIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))

    if (!ids.length) return { success: false, message: "Nenhum pedido válido selecionado." }

    try {
        const result = await CorreioElegante.deleteMany({ _id: { $in: ids } })
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} pedido(s) deletado(s) com sucesso.`,
        }
    } catch {
        return { success: false, message: "Erro ao deletar os pedidos." }
    }
}
