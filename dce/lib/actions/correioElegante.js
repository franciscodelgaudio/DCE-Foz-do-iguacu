'use server'

import { z } from "zod"
import mongoose from "mongoose"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CorreioElegante } from "@/models/correioElegante"
import { User } from "@/models/user"
import { Settings } from "@/models/settings"
import { formatBrazilWhatsapp, normalizeBrazilWhatsapp } from "@/lib/whatsapp"

function crc16(str) {
    let crc = 0xFFFF
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

function emv(id, value) {
    const v = String(value)
    return `${id}${String(v.length).padStart(2, '0')}${v}`
}

function buildPixPayload(pixKey, merchantName, amountNum, txid) {
    const mai = emv('26', emv('00', 'BR.GOV.BCB.PIX') + emv('01', pixKey))
    const name = merchantName.normalize('NFD').replace(/[̀-ͯ]/g, '').substring(0, 25).toUpperCase()
    const txidClean = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'CORREIOELEGANTE'
    const body = [
        '000201', '010211', mai,
        '52040000', '5303986',
        emv('54', amountNum.toFixed(2)),
        '5802BR',
        emv('59', name),
        emv('60', 'CASCAVEL'),
        emv('62', emv('05', txidClean)),
        '6304',
    ].join('')
    return body + crc16(body)
}

const PACKAGES = {
    cartinha: { label: "Cartinha", price: 2.5, items: { cartinha: 1, rosa: 0, bombom: 0 } },
    rosa: { label: "Rosa + Cartinha", price: 6.0, items: { cartinha: 1, rosa: 1, bombom: 0 } },
    bombom_cartinha: { label: "Bombom + Cartinha", price: 5.0, items: { cartinha: 1, rosa: 0, bombom: 1 } },
    bombom_cartinha_rosa: { label: "Bombom + Cartinha + Rosa", price: 8.5, items: { cartinha: 1, rosa: 1, bombom: 1 } },
}

const STOCK_ITEMS = ["cartinha", "rosa", "bombom"]

function normalizeStock(stock = {}) {
    return STOCK_ITEMS.reduce((acc, item) => {
        acc[item] = Math.max(0, Number(stock[item] ?? 0))
        return acc
    }, {})
}

function buildUsedStock(orders = []) {
    return orders.reduce((acc, order) => {
        const pkgItems = PACKAGES[order.package]?.items
        if (!pkgItems) return acc
        STOCK_ITEMS.forEach((item) => {
            acc[item] += pkgItems[item] ?? 0
        })
        return acc
    }, { cartinha: 0, rosa: 0, bombom: 0 })
}

function buildInventory(settings, orders = []) {
    const total = normalizeStock(settings?.correioEleganteStock)
    const used = buildUsedStock(orders)
    const remaining = STOCK_ITEMS.reduce((acc, item) => {
        acc[item] = Math.max(0, total[item] - used[item])
        return acc
    }, {})
    const packages = Object.fromEntries(Object.entries(PACKAGES).map(([key, pkg]) => [
        key,
        {
            available: STOCK_ITEMS.every((item) => remaining[item] >= (pkg.items[item] ?? 0)),
            remaining: Math.min(...STOCK_ITEMS
                .filter((item) => (pkg.items[item] ?? 0) > 0)
                .map((item) => remaining[item])),
        },
    ]))
    return { total, used, remaining, packages }
}

export async function getCorreioEleganteInventory() {
    const [settings, activeOrders] = await Promise.all([
        Settings.findOne().lean(),
        CorreioElegante.find({ paymentStatus: "confirmed" }).select("package").lean(),
    ])

    return buildInventory(settings, activeOrders)
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
    const inventory = await getCorreioEleganteInventory()
    if (!inventory.packages[pkg]?.available) {
        return { success: false, message: "Este pacote está esgotado. Escolha outra opção disponível." }
    }

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

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem confirmar pagamentos." }
    }

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

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem cancelar pedidos." }
    }

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

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem excluir pedidos." }
    }

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

    const role = session.user?.role
    if (role !== "admin" && role !== "membro") {
        return { success: false, message: "Sem permissão para atualizar o status de entrega." }
    }

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

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem atualizar o status de entrega." }
    }

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

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem excluir pedidos." }
    }

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

export async function toggleAnonymous(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem alterar esta configuração." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        const order = await CorreioElegante.findById(orderId).select("isAnonymous")
        if (!order) return { success: false, message: "Pedido não encontrado." }

        const newValue = !order.isAnonymous
        await CorreioElegante.findByIdAndUpdate(orderId, { isAnonymous: newValue })
        return {
            success: true,
            isAnonymous: newValue,
            message: newValue ? "Remetente marcado como anônimo." : "Anonimato removido do remetente.",
        }
    } catch {
        return { success: false, message: "Erro ao atualizar o pedido." }
    }
}

export async function toggleEarlyDelivery(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem alterar esta configuração." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    try {
        const order = await CorreioElegante.findById(orderId).select("earlyDelivery")
        if (!order) return { success: false, message: "Pedido não encontrado." }

        const newValue = !order.earlyDelivery
        await CorreioElegante.findByIdAndUpdate(orderId, { earlyDelivery: newValue })
        return {
            success: true,
            earlyDelivery: newValue,
            message: newValue ? "Entrega antecipada (11/06) ativada." : "Entrega antecipada removida.",
        }
    } catch {
        return { success: false, message: "Erro ao atualizar o pedido." }
    }
}

export async function updateCardMessage(orderId, message) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem editar mensagens." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    const trimmed = (message ?? "").trim()
    if (trimmed.length > 500) {
        return { success: false, message: "Mensagem não pode ultrapassar 500 caracteres." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, { cardMessage: trimmed })
        return { success: true, message: "Mensagem atualizada!" }
    } catch {
        return { success: false, message: "Erro ao atualizar a mensagem." }
    }
}

export async function updateOrderDetails(orderId, data) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem editar pedidos." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    const schema = z.object({
        package: z.enum(["cartinha", "rosa", "bombom_cartinha", "bombom_cartinha_rosa"]).optional(),
        recipientYear: z.string().max(100).optional(),
        recipientCourse: z.string().max(200).optional(),
        senderEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    })

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        return { success: false, message: "Dados inválidos.", errors: parsed.error.flatten().fieldErrors }
    }

    const update = {}
    if (parsed.data.package !== undefined) {
        update.package = parsed.data.package
        update.price = PACKAGES[parsed.data.package].price
    }
    if (parsed.data.recipientYear !== undefined) update.recipientYear = parsed.data.recipientYear
    if (parsed.data.recipientCourse !== undefined) update.recipientCourse = parsed.data.recipientCourse
    if (parsed.data.senderEmail !== undefined) update.senderEmail = parsed.data.senderEmail

    if (Object.keys(update).length === 0) {
        return { success: false, message: "Nenhum campo para atualizar." }
    }

    try {
        await CorreioElegante.findByIdAndUpdate(orderId, update)
        return { success: true, message: "Pedido atualizado com sucesso!" }
    } catch {
        return { success: false, message: "Erro ao atualizar o pedido." }
    }
}

export async function resendConfirmationEmail(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem reenviar emails." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    const order = await CorreioElegante.findById(orderId).lean()
    if (!order) return { success: false, message: "Pedido não encontrado." }
    if (!order.senderEmail) return { success: false, message: "Este pedido não tem email cadastrado." }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, message: "Serviço de email não configurado." }
    }

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
                            🎁 Entrega: <strong>${order.earlyDelivery ? "11 de junho" : "12 de junho"}</strong> — o DCE levará seu presente até o destinatário!
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
            console.error("[resendConfirmationEmail] Resend retornou erro:", emailResult.error)
            return { success: false, message: "Erro ao enviar o email." }
        }

        console.log("[resendConfirmationEmail] Email reenviado:", emailResult.data?.id)
        return { success: true, message: `Email de confirmação reenviado para ${order.senderEmail}!` }
    } catch (err) {
        console.error("[resendConfirmationEmail] Exceção:", err)
        return { success: false, message: "Erro ao enviar o email." }
    }
}

export async function sendPaymentReminderEmail(orderId) {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem enviar lembretes." }
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return { success: false, message: "ID inválido." }
    }

    const order = await CorreioElegante.findById(orderId).lean()
    if (!order) return { success: false, message: "Pedido não encontrado." }
    if (order.paymentStatus !== "pending") return { success: false, message: "Este pedido não está com pagamento pendente." }
    if (!order.senderEmail) return { success: false, message: "Este pedido não tem email cadastrado." }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, message: "Serviço de email não configurado." }
    }

    try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const pkgLabels = {
            cartinha: "Cartinha",
            rosa: "Rosa + Cartinha",
            bombom_cartinha: "Bombom + Cartinha",
            bombom_cartinha_rosa: "Bombom + Cartinha + Rosa",
        }
        const pkgLabel = pkgLabels[order.package] ?? order.package
        const priceFormatted = Number(order.price).toFixed(2).replace(".", ",")

        const [settings, adminEmails] = await Promise.all([
            Settings.findOne().lean(),
            User.find({ role: "admin", status: "ativo" }).distinct("email"),
        ])
        const pixKey = settings?.pixKey
        const pixRecipientName = settings?.pixRecipientName || "DCE UNIOESTE"

        let pixSection = ""
        if (pixKey) {
            const pixPayload = buildPixPayload(pixKey, pixRecipientName, Number(order.price), order.orderNumber)
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`
            pixSection = `
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
                    <p style="color:#166534;font-size:14px;font-weight:700;margin:0 0 4px;">Pague via PIX</p>
                    <p style="color:#166534;font-size:13px;margin:0 0 16px;">Escaneie o QR Code ou use o código Copia e Cola abaixo</p>
                    <div style="margin-bottom:12px;">
                        <div style="display:inline-block;background:#fff;border:2px solid #bbf7d0;border-radius:12px;padding:10px;">
                            <img src="${qrUrl}" alt="QR Code PIX" width="200" height="200" style="display:block;" />
                        </div>
                    </div>
                    <div style="background:#fff;border:1px solid #bbf7d0;border-radius:8px;padding:10px 12px;margin-bottom:8px;text-align:left;">
                        <p style="color:#166534;font-size:11px;font-weight:700;margin:0 0 4px;">PIX Copia e Cola — Valor travado · R$ ${priceFormatted}</p>
                        <p style="color:#374151;font-size:10px;font-family:monospace;word-break:break-all;margin:0;">${pixPayload}</p>
                    </div>
                    <p style="color:#166534;font-size:11px;margin:0;">O nº do pedido <strong>${order.orderNumber}</strong> está identificado no PIX.</p>
                </div>
            `
        }

        const emailResult = await resend.emails.send({
            from: "DCE UNIOESTE <no-reply@dceunioestefoz.org>",
            to: order.senderEmail,
            cc: adminEmails.length > 0 ? adminEmails : undefined,
            subject: `Lembrete de pagamento — Pedido ${order.orderNumber} · Correio Elegante DCE`,
            html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;background:#fff;">
                    <div style="text-align:center;margin-bottom:28px;">
                        <img src="https://dceunioestefoz.org/images/home/logo.png" alt="DCE UNIOESTE" style="height:72px;width:auto;" />
                    </div>
                    <div style="text-align:center;margin-bottom:12px;">
                        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:#fdf25a;border-radius:50%;border:3px solid #be123c;">
                            <span style="font-size:32px;">&#128140;</span>
                        </div>
                    </div>
                    <h1 style="color:#be123c;text-align:center;font-size:24px;margin-bottom:4px;">Lembrete de pagamento</h1>
                    <p style="text-align:center;color:#64748b;margin-bottom:8px;">Seu pedido foi registrado, mas o pagamento ainda não foi identificado.</p>
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin-bottom:20px;text-align:center;">
                        <p style="color:#92400e;font-size:13px;font-weight:600;margin:0;">&#9888;&#65039; Pagamento pendente</p>
                        <p style="color:#92400e;font-size:13px;margin:4px 0 0;">Realize o pagamento via PIX abaixo para garantir o seu Correio Elegante!</p>
                    </div>
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
                            <span style="color:#64748b;font-size:14px;">Curso / Período</span>
                            <strong style="color:#1e293b;">${order.recipientCourse}${order.recipientYear ? ` — ${order.recipientYear}` : ""}</strong>
                        </div>` : ""}
                        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #fecdd3;padding-top:14px;margin-top:4px;">
                            <span style="color:#64748b;font-size:14px;">Valor a pagar</span>
                            <strong style="color:#be123c;font-size:18px;">R$ ${priceFormatted}</strong>
                        </div>
                    </div>
                    ${pixSection}
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:28px;text-align:center;">
                        <p style="color:#166534;font-size:14px;margin:0;">
                            &#127881; Entrega: <strong>${order.earlyDelivery ? "11 de junho" : "12 de junho"}</strong> — o DCE levará seu presente até o destinatário!
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
            console.error("[sendPaymentReminderEmail] Resend retornou erro:", emailResult.error)
            return { success: false, message: "Erro ao enviar o lembrete." }
        }

        console.log("[sendPaymentReminderEmail] Lembrete enviado:", emailResult.data?.id)
        return { success: true, message: `Lembrete de pagamento enviado para ${order.senderEmail}!` }
    } catch (err) {
        console.error("[sendPaymentReminderEmail] Exceção:", err)
        return { success: false, message: "Erro ao enviar o lembrete." }
    }
}

export async function fixDuplicateOrderNumbers() {
    const session = await auth()
    if (!session) redirect("/login")

    if (session.user?.role !== "admin") {
        return { success: false, message: "Apenas administradores podem executar esta ação." }
    }

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
