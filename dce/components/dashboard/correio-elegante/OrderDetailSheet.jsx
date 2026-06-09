'use client'

import { useState } from "react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/components/ui/formatDate"
import { MessageSquare, User, Heart, Package, CreditCard, Phone, Eye, EyeOff, UserX, UserCheck } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { toggleAnonymous } from "@/lib/actions/correioElegante"

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

    async function handleToggleAnonymous() {
        const result = await toggleAnonymous(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    if (!order) return null

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) setSenderRevealed(false); onOpenChange(v) }}>
            <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
                <SheetHeader className="pb-0">
                    <div className="flex items-center gap-2">
                        <SheetTitle className="font-mono text-[#2708ab]">{order.orderNumber}</SheetTitle>
                        <Badge variant="outline" className={STATUS_STYLES[order.paymentStatus]}>
                            {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                        </Badge>
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

                    <Separator />

                    <DetailSection icon={MessageSquare} title="Mensagem do cartão">
                        <div className="min-h-[80px] rounded-lg border bg-white px-3 py-3">
                            {order.cardMessage ? (
                                <p className="whitespace-pre-wrap text-sm text-slate-700">{order.cardMessage}</p>
                            ) : (
                                <p className="italic text-sm text-slate-300">Sem mensagem</p>
                            )}
                        </div>
                    </DetailSection>

                    {order.adminNotes && (
                        <>
                            <Separator />
                            <DetailSection icon={CreditCard} title="Notas internas">
                                <p className="text-sm text-slate-600">{order.adminNotes}</p>
                            </DetailSection>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
