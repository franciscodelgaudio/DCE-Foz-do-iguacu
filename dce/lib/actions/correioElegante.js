'use server'

import { z } from "zod"
import mongoose from "mongoose"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CorreioElegante } from "@/models/correioElegante"
import { User } from "@/models/user"
import { formatBrazilWhatsapp, normalizeBrazilWhatsapp } from "@/lib/whatsapp"

const PACKAGES = {
    cartinha: { label: "Cartinha", price: 2.5 },
    rosa: { label: "Rosa + Cartinha", price: 6.0 },
    bombom_cartinha: { label: "Bombom + Cartinha", price: 5.0 },
    bombom_cartinha_rosa: { label: "Bombom + Cartinha + Rosa", price: 8.5 },
}

const orderSchema = z.object({
    senderName: z.string().min(2, "Nome do remetente é obrigatório"),
    senderContact: z
        .string()
        .refine((value) => Boolean(normalizeBrazilWhatsapp(value)), "WhatsApp inválido")
        .transform(formatBrazilWhatsapp),
    senderEmail: z.string().email("Email inválido").optional().or(z.literal("")),
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

    const { senderName, senderContact, senderEmail, recipientName, recipientCourse, recipientYear, package: pkg, cardMessage, isAnonymous } =
        parsed.data
    const pkgInfo = PACKAGES[pkg]

    const lastOrder = await CorreioElegante.findOne({ orderNumber: /^CE-\d+$/ }).sort({ orderNumber: -1 }).lean()
    let nextNum = 1
    if (lastOrder?.orderNumber) {
        const m = lastOrder.orderNumber.match(/CE-(\d+)/)
        if (m) nextNum = parseInt(m[1], 10) + 1
    }
    const orderNumber = `CE-${String(nextNum).padStart(3, "0")}`

    try {
        await CorreioElegante.create({
            orderNumber,
            senderName,
            senderContact,
            senderEmail: senderEmail || undefined,
            recipientName,
            recipientCourse,
            recipientYear,
            package: pkg,
            price: pkgInfo.price,
            cardMessage: cardMessage ?? "",
            isAnonymous: isAnonymous ?? false,
            paymentStatus: "pending",
        })
        const priceFormatted = Number(pkgInfo.price).toFixed(2).replace(".", ",")
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
        const order = await CorreioElegante.findByIdAndUpdate(
            orderId,
            { paymentStatus: "confirmed", confirmedAt: new Date() },
            { new: true }
        )

        if (!order?.senderEmail) {
            console.log("[confirmPayment] Pedido sem senderEmail, email não enviado.")
        } else if (!process.env.RESEND_API_KEY) {
            console.warn("[confirmPayment] RESEND_API_KEY não configurada, email não enviado.")
        } else {
            try {
                const { Resend } = await import("resend")
                const resend = new Resend(process.env.RESEND_API_KEY)
                const adminEmails = await User.find({ role: "admin", status: "ativo" }).distinct("email")
                const pkgLabels = {
                    cartinha: "Cartinha",
                    rosa: "Rosa + Cartinha",
                    bombom_cartinha: "Bombom + Cartinha",
                    bombom_cartinha_rosa: "Bombom + Cartinha + Rosa",
                }
                const pkgLabel = pkgLabels[order.package] ?? order.package
                const priceFormatted = Number(order.price).toFixed(2).replace(".", ",")
                console.log(`[confirmPayment] Enviando email para ${order.senderEmail}...`)
                const emailResult = await resend.emails.send({
                    from: "DCE UNIOESTE <no-reply@dceunioestefoz.org>",
                    to: order.senderEmail,
                    cc: adminEmails.length > 0 ? adminEmails : undefined,
                    subject: `Pagamento confirmado! Pedido ${order.orderNumber} — Correio Elegante DCE`,
                    html: `
                        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;background:#fff;">
                            <div style="text-align:center;margin-bottom:28px;">
                                <img src="https://dceunioestefoz.org/images/home/logo.png" alt="DCE UNIOESTE" style="height:72px;width:auto;" />
                            </div>
                            <div style="text-align:center;margin-bottom:12px;">
                                <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:#fdf25a;border-radius:50%;border:3px solid #be123c;">
                                    <span style="font-size:32px;">&#10084;</span>
                                </div>
                            </div>
                            <h1 style="color:#be123c;text-align:center;font-size:24px;margin-bottom:4px;">Pagamento confirmado!</h1>
                            <p style="text-align:center;color:#64748b;margin-bottom:28px;">Seu Correio Elegante está garantido. 💌</p>
                            <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:20px;margin-bottom:20px;">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">Nº do pedido</span>
                                    <strong style="color:#be123c;font-size:15px;">${order.orderNumber}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">Pacote</span>
                                    <strong style="color:#1e293b;">${pkgLabel}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">Para</span>
                                    <strong style="color:#1e293b;">${order.recipientName}</strong>
                                </div>
                                ${order.recipientCourse ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">Curso${order.recipientYear ? " / Período" : ""}</span>
                                    <strong style="color:#1e293b;">${order.recipientCourse}${order.recipientYear ? ` — ${order.recipientYear}` : ""}</strong>
                                </div>` : ""}
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">De</span>
                                    <strong style="color:#1e293b;">${order.isAnonymous ? "Anônimo 🤫" : order.senderName}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                    <span style="color:#64748b;font-size:14px;">E-mail</span>
                                    <strong style="color:#1e293b;">${order.senderEmail}</strong>
                                </div>
                                <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #fecdd3;padding-top:14px;margin-top:4px;">
                                    <span style="color:#64748b;font-size:14px;">Valor pago</span>
                                    <strong style="color:#be123c;font-size:18px;">R$ ${priceFormatted}</strong>
                                </div>
                            </div>
                            ${order.cardMessage ? `<div style="background:#fdf8ff;border:1px solid #e9d5ff;border-radius:12px;padding:16px;margin-bottom:20px;">
                                <p style="color:#7c3aed;font-size:13px;font-weight:600;margin:0 0 6px;">Mensagem da cartinha:</p>
                                <p style="color:#1e293b;font-size:14px;font-style:italic;margin:0;">"${order.cardMessage}"</p>
                            </div>` : ""}
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:28px;text-align:center;">
                                <p style="color:#166534;font-size:14px;margin:0;">
                                    🎁 Entrega: <strong>12 de junho</strong> — o DCE levará seu presente até o destinatário!
                                </p>
                            </div>
                            <hr style="border:none;border-top:1px solid #f1f5f9;margin-bottom:16px;" />
                            <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
                                DCE UNIOESTE — Campus Foz do Iguaçu<br>
                                Este é um email automático, não responda.
                            </p>
                        </div>
                    `,
                })
                if (emailResult.error) {
                    console.error("[confirmPayment] Resend retornou erro:", emailResult.error)
                } else {
                    console.log("[confirmPayment] Email enviado com sucesso:", emailResult.data?.id)
                }
            } catch (emailErr) {
                console.error("[confirmPayment] Exceção ao enviar email:", emailErr)
            }
        }

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

export async function markOrderReady(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, {
            deliveryStatus: "ready",
            readyAt: new Date(),
        })
        return { success: true, message: "Pedido marcado como pronto!" }
    } catch {
        return { success: false, message: "Erro ao atualizar o pedido." }
    }
}

export async function markOrderDelivered(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, {
            deliveryStatus: "delivered",
            deliveredAt: new Date(),
        })
        return { success: true, message: "Pedido marcado como entregue!" }
    } catch {
        return { success: false, message: "Erro ao marcar como entregue." }
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

export async function fixDuplicateOrderNumbers() {
    const session = await auth()
    if (!session) redirect("/login")

    // Load all orders oldest-first so the earliest occurrence keeps its number
    const orders = await CorreioElegante.find().sort({ createdAt: 1 }).lean()

    // Find current max numeric value across all orders
    let maxNum = 0
    for (const order of orders) {
        const m = order.orderNumber?.match(/^CE-(\d+)$/)
        if (m) {
            const n = parseInt(m[1], 10)
            if (n > maxNum) maxNum = n
        }
    }

    // Collect IDs of duplicate order numbers (keep first occurrence)
    const seen = new Set()
    const toFix = []
    for (const order of orders) {
        if (seen.has(order.orderNumber)) {
            toFix.push(order._id)
        } else {
            seen.add(order.orderNumber)
        }
    }

    // Renumber duplicates sequentially above the current max — no deletes
    for (const id of toFix) {
        maxNum++
        const newOrderNumber = `CE-${String(maxNum).padStart(3, "0")}`
        await CorreioElegante.findByIdAndUpdate(id, { orderNumber: newOrderNumber })
    }

    return {
        success: true,
        fixed: toFix.length,
        message: toFix.length > 0
            ? `${toFix.length} pedido(s) renumerado(s) com sucesso.`
            : "Nenhum número duplicado encontrado.",
    }
}
