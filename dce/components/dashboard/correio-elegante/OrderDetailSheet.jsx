'use client'

import { useState } from "react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/components/ui/formatDate"
import {
    MessageSquare, User, Heart, Package, CreditCard, Phone, Eye, EyeOff,
    UserX, UserCheck, Pencil, X, Check, CalendarClock, Mail, Send,
} from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    toggleAnonymous, toggleEarlyDelivery, updateCardMessage,
    updateOrderDetails, resendConfirmationEmail, sendPaymentReminderEmail,
} from "@/lib/actions/correioElegante"

const STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
}

const STATUS_LABELS = {
    pending: "Aguardando pagamento",
    confirmed: "Pagamento confirmado",
    cancelled: "Cancelado",
}

const PACKAGE_LABELS = {
    cartinha: "Cartinha",
    rosa: "Rosa + Cartinha",
    bombom_cartinha: "Bombom + Cartinha",
    bombom_cartinha_rosa: "Bombom + Cartinha + Rosa",
}

const PACKAGE_OPTIONS = [
    { value: "cartinha", label: "Cartinha", price: "R$ 2,50" },
    { value: "rosa", label: "Rosa + Cartinha", price: "R$ 6,00" },
    { value: "bombom_cartinha", label: "Bombom + Cartinha", price: "R$ 5,00" },
    { value: "bombom_cartinha_rosa", label: "Bombom + Cartinha + Rosa", price: "R$ 8,50" },
]

function DetailSection({ icon: Icon, title, children }) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <Icon className="size-4 text-[#2708ab]" />
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            </div>
            {children}
        </div>
    )
}

export function OrderDetailSheet({ order, open, onOpenChange, isAdmin }) {
    const router = useRouter()
    const [senderRevealed, setSenderRevealed] = useState(false)
    const [editingMessage, setEditingMessage] = useState(false)
    const [messageValue, setMessageValue] = useState("")
    const [savingMessage, setSavingMessage] = useState(false)
    const [editingOrder, setEditingOrder] = useState(false)
    const [orderForm, setOrderForm] = useState({})
    const [savingOrder, setSavingOrder] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(false)
    const [sendingReminder, setSendingReminder] = useState(false)

    async function handleToggleAnonymous() {
        const result = await toggleAnonymous(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleToggleEarlyDelivery() {
        const result = await toggleEarlyDelivery(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    function startEditingMessage() {
        setMessageValue(order.cardMessage ?? "")
        setEditingMessage(true)
    }

    async function handleSaveMessage() {
        setSavingMessage(true)
        const result = await updateCardMessage(order._id, messageValue)
        setSavingMessage(false)
        if (result.success) {
            router.refresh()
            setEditingMessage(false)
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    function startEditingOrder() {
        setOrderForm({
            package: order.package,
            recipientYear: order.recipientYear ?? "",
            recipientCourse: order.recipientCourse ?? "",
            senderEmail: order.senderEmail ?? "",
        })
        setEditingOrder(true)
    }

    async function handleSaveOrder() {
        setSavingOrder(true)
        const result = await updateOrderDetails(order._id, orderForm)
        setSavingOrder(false)
        if (result.success) {
            router.refresh()
            setEditingOrder(false)
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleResendEmail() {
        setSendingEmail(true)
        const result = await resendConfirmationEmail(order._id)
        setSendingEmail(false)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleSendReminder() {
        setSendingReminder(true)
        const result = await sendPaymentReminderEmail(order._id)
        setSendingReminder(false)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    if (!order) return null

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) { setSenderRevealed(false); setEditingOrder(false); setEditingMessage(false) } onOpenChange(v) }}>
            <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
                <SheetHeader className="pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <SheetTitle className="font-mono text-[#2708ab]">{order.orderNumber}</SheetTitle>
                        <Badge variant="outline" className={STATUS_STYLES[order.paymentStatus]}>
                            {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                        </Badge>
                        {order.earlyDelivery && (
                            <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-700">
                                <CalendarClock className="mr-1 size-3" />
                                Entrega 11/06
                            </Badge>
                        )}
                    </div>
                    <SheetDescription>
                        Criado em {formatDate(order.createdAt) ?? "—"}
                        {order.paymentStatus === "confirmed" && order.confirmedAt && (
                            <> · Confirmado em {formatDate(order.confirmedAt)}</>
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-5 overflow-y-auto px-4 pb-6">
                    <DetailSection icon={Package} title="Pacote">
                        <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                            <span className="text-sm">{PACKAGE_LABELS[order.package] ?? order.package}</span>
                            <span className="font-bold text-[#2708ab]">
                                R$ {Number(order.price).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </DetailSection>

                    <Separator />

                    <DetailSection icon={User} title="Remetente">
                        <div className="space-y-1.5 rounded-lg border bg-slate-50 px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                                {order.isAnonymous ? (
                                    <>
                                        <p className={`text-sm font-medium ${senderRevealed ? "" : "tracking-widest text-slate-400"}`}>
                                            {senderRevealed ? order.senderName : "••••••••"}
                                        </p>
                                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                            anônimo
                                        </span>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setSenderRevealed((v) => !v)}
                                                className="text-slate-400 hover:text-slate-600"
                                                title={senderRevealed ? "Ocultar nome" : "Revelar nome"}
                                            >
                                                {senderRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm font-medium">{order.senderName}</p>
                                )}
                            </div>
                            {order.senderContact && (
                                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Phone className="size-3 shrink-0" />
                                    {order.isAnonymous && !senderRevealed ? "•••••••••••" : order.senderContact}
                                </p>
                            )}
                            {order.senderEmail && (
                                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Mail className="size-3 shrink-0" />
                                    {order.isAnonymous && !senderRevealed ? "•••••••••••" : order.senderEmail}
                                </p>
                            )}
                        </div>
                        {isAdmin && (
                            <ConfirmDialog
                                title={order.isAnonymous ? "Remover anonimato" : "Marcar como anônimo"}
                                subtitle={
                                    order.isAnonymous
                                        ? `O nome do remetente voltará a aparecer no pedido ${order.orderNumber}.`
                                        : `O remetente do pedido ${order.orderNumber} será marcado como anônimo.`
                                }
                                onClick={handleToggleAnonymous}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-full gap-1.5 text-xs"
                                >
                                    {order.isAnonymous
                                        ? <><UserCheck className="size-3.5" /> Remover anonimato</>
                                        : <><UserX className="size-3.5" /> Tornar anônimo</>
                                    }
                                </Button>
                            </ConfirmDialog>
                        )}
                    </DetailSection>

                    {isAdmin && (
                        <ConfirmDialog
                            title={order.earlyDelivery ? "Remover entrega antecipada" : "Marcar entrega antecipada (11/06)"}
                            subtitle={
                                order.earlyDelivery
                                    ? `O pedido ${order.orderNumber} voltará à data padrão de entrega (12/06).`
                                    : `O pedido ${order.orderNumber} será marcado para entrega no dia 11/06 (exceção).`
                            }
                            onClick={handleToggleEarlyDelivery}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className={`mt-2 w-full gap-1.5 text-xs ${order.earlyDelivery ? "border-orange-200 text-orange-700 hover:bg-orange-50" : ""}`}
                            >
                                <CalendarClock className="size-3.5" />
                                {order.earlyDelivery ? "Remover entrega 11/06" : "Marcar entrega 11/06"}
                            </Button>
                        </ConfirmDialog>
                    )}

                    <Separator />

                    <DetailSection icon={Heart} title="Destinatário">
                        <div className="space-y-1 rounded-lg border bg-slate-50 px-3 py-2.5">
                            <p className="text-sm font-medium">{order.recipientName}</p>
                            {(order.recipientCourse || order.recipientYear) && (
                                <p className="text-xs text-slate-500">
                                    {order.recipientCourse}{order.recipientYear ? ` · ${order.recipientYear}` : ""}
                                </p>
                            )}
                        </div>
                    </DetailSection>

                    {isAdmin && (
                        <>
                            <Separator />

                            <DetailSection icon={Pencil} title="Editar pedido">
                                {editingOrder ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Pacote</label>
                                            <select
                                                value={orderForm.package}
                                                onChange={(e) => setOrderForm((f) => ({ ...f, package: e.target.value }))}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                {PACKAGE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label} — {opt.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Ano / Período do destinatário</label>
                                            <input
                                                type="text"
                                                value={orderForm.recipientYear}
                                                onChange={(e) => setOrderForm((f) => ({ ...f, recipientYear: e.target.value }))}
                                                placeholder="Ex: 3º ano, 2º semestre..."
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Curso do destinatário</label>
                                            <input
                                                type="text"
                                                value={orderForm.recipientCourse}
                                                onChange={(e) => setOrderForm((f) => ({ ...f, recipientCourse: e.target.value }))}
                                                placeholder="Ex: Engenharia Civil..."
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">E-mail do remetente</label>
                                            <input
                                                type="email"
                                                value={orderForm.senderEmail}
                                                onChange={(e) => setOrderForm((f) => ({ ...f, senderEmail: e.target.value }))}
                                                placeholder="email@exemplo.com"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 gap-1.5 text-xs"
                                                onClick={handleSaveOrder}
                                                disabled={savingOrder}
                                            >
                                                <Check className="size-3.5" />
                                                Salvar alterações
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 text-xs"
                                                onClick={() => setEditingOrder(false)}
                                                disabled={savingOrder}
                                            >
                                                <X className="size-3.5" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1.5 text-xs"
                                        onClick={startEditingOrder}
                                    >
                                        <Pencil className="size-3.5" />
                                        Editar pacote, ano, curso e e-mail
                                    </Button>
                                )}
                            </DetailSection>
                        </>
                    )}

                    <Separator />

                    <DetailSection icon={MessageSquare} title="Mensagem do cartão">
                        {editingMessage ? (
                            <div className="space-y-2">
                                <textarea
                                    value={messageValue}
                                    onChange={(e) => setMessageValue(e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                    placeholder="Mensagem da cartinha..."
                                    autoFocus
                                />
                                <p className="text-right text-xs text-slate-400">{messageValue.length}/500</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-1.5 text-xs"
                                        onClick={handleSaveMessage}
                                        disabled={savingMessage}
                                    >
                                        <Check className="size-3.5" />
                                        Salvar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5 text-xs"
                                        onClick={() => setEditingMessage(false)}
                                        disabled={savingMessage}
                                    >
                                        <X className="size-3.5" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="min-h-[80px] rounded-lg border bg-white px-3 py-3">
                                    {order.cardMessage ? (
                                        <p className="whitespace-pre-wrap text-sm text-slate-700">{order.cardMessage}</p>
                                    ) : (
                                        <p className="italic text-sm text-slate-300">Sem mensagem</p>
                                    )}
                                </div>
                                {isAdmin && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full gap-1.5 text-xs"
                                        onClick={startEditingMessage}
                                    >
                                        <Pencil className="size-3.5" />
                                        Editar mensagem
                                    </Button>
                                )}
                            </>
                        )}
                    </DetailSection>

                    {order.adminNotes && (
                        <>
                            <Separator />
                            <DetailSection icon={CreditCard} title="Notas internas">
                                <p className="text-sm text-slate-600">{order.adminNotes}</p>
                            </DetailSection>
                        </>
                    )}

                    {isAdmin && order.senderEmail && (
                        <>
                            <Separator />
                            <DetailSection icon={Mail} title="Emails">
                                <p className="mb-3 text-xs text-slate-500">
                                    Destinatário: <span className="font-medium text-slate-700">{order.senderEmail}</span>
                                </p>
                                {order.paymentStatus === "pending" && (
                                    <ConfirmDialog
                                        title="Enviar lembrete de pagamento"
                                        subtitle={`Será enviado um lembrete com o QR Code PIX para ${order.senderEmail}.`}
                                        onClick={handleSendReminder}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mb-2 w-full gap-1.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                                            disabled={sendingReminder}
                                        >
                                            <Send className="size-3.5" />
                                            {sendingReminder ? "Enviando..." : "Enviar lembrete com QR Code PIX"}
                                        </Button>
                                    </ConfirmDialog>
                                )}
                                {order.paymentStatus === "confirmed" && (
                                    <ConfirmDialog
                                        title="Reenviar email de confirmação"
                                        subtitle={`Será enviado o email de pagamento confirmado para ${order.senderEmail}.`}
                                        onClick={handleResendEmail}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-1.5 text-xs"
                                            disabled={sendingEmail}
                                        >
                                            <Send className="size-3.5" />
                                            {sendingEmail ? "Enviando..." : "Reenviar email de confirmação"}
                                        </Button>
                                    </ConfirmDialog>
                                )}
                            </DetailSection>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
