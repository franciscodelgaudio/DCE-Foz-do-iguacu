'use client'

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { OrderDetailSheet } from "./OrderDetailSheet"
import { useRouter } from "next/navigation"
import { formatDate } from "@/components/ui/formatDate"
import { toast } from "sonner"
import { confirmPayment, cancelOrder, deleteOrder } from "@/lib/actions/correioElegante"

const PACKAGE_LABELS = {
    cartinha: "Cartinha",
    bombom_cartinha: "Bombom + Cartinha",
}

const STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
}

const STATUS_LABELS = {
    pending: "Aguardando",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
}

export function OrderRow({ order, selected, onSelectChange }) {
    const router = useRouter()
    const [sheetOpen, setSheetOpen] = useState(false)

    async function handleConfirm() {
        const result = await confirmPayment(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleCancel() {
        const result = await cancelOrder(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleDelete() {
        const result = await deleteOrder(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <>
            <OrderDetailSheet order={order} open={sheetOpen} onOpenChange={setSheetOpen} />
            <TableRow>
                <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                    <input
                        type="checkbox"
                        aria-label={`Selecionar pedido ${order.orderNumber}`}
                        checked={selected}
                        onChange={() => onSelectChange?.(order._id)}
                        className="size-4 accent-[#2708ab]"
                    />
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-[#2708ab]">
                    {order.orderNumber}
                </TableCell>
                <TableCell>
                    <span className="text-xs">{PACKAGE_LABELS[order.package] ?? order.package}</span>
                    <span className="ml-1.5 text-xs font-bold text-slate-500">R$ {Number(order.price).toFixed(2).replace('.', ',')}</span>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium">{order.senderName}</p>
                        {order.isAnonymous && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                anônimo
                            </span>
                        )}
                    </div>
                    {order.senderContact && (
                        <p className="text-xs text-slate-400">{order.senderContact}</p>
                    )}
                </TableCell>
                <TableCell>
                    <p className="text-sm font-medium">{order.recipientName}</p>
                    {order.recipientCourse && (
                        <p className="text-xs text-slate-400">{order.recipientCourse}{order.recipientYear ? ` · ${order.recipientYear}` : ""}</p>
                    )}
                </TableCell>
                <TableCell className="max-w-[180px]">
                    <p className="line-clamp-2 text-xs text-slate-500">
                        {order.cardMessage || <span className="italic text-slate-300">Sem mensagem</span>}
                    </p>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                    {formatDate(order.createdAt) ?? "—"}
                </TableCell>
                <TableCell>
                    <Badge
                        variant="outline"
                        className={STATUS_STYLES[order.paymentStatus] ?? ""}
                    >
                        {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#2708ab]/60 hover:text-[#2708ab]"
                            onClick={() => setSheetOpen(true)}
                        >
                            <Eye className="size-4" />
                        </Button>
                        {order.paymentStatus === "pending" && (
                            <ConfirmDialog
                                title="Confirmar pagamento"
                                subtitle={`Confirmar pagamento do pedido ${order.orderNumber} de ${order.senderName}?`}
                                onClick={handleConfirm}
                            >
                                <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-700">
                                    <CheckCircle className="size-4" />
                                </Button>
                            </ConfirmDialog>
                        )}
                        {order.paymentStatus === "pending" && (
                            <ConfirmDialog
                                title="Cancelar pedido"
                                subtitle={`Cancelar o pedido ${order.orderNumber} de ${order.senderName}?`}
                                onClick={handleCancel}
                            >
                                <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700">
                                    <XCircle className="size-4" />
                                </Button>
                            </ConfirmDialog>
                        )}
                        <ConfirmDialog
                            title="Excluir pedido"
                            subtitle={`Excluir permanentemente o pedido ${order.orderNumber}? Esta ação não pode ser desfeita.`}
                            onClick={handleDelete}
                        >
                            <Button variant="ghost" size="icon">
                                <Trash2 className="size-4" />
                            </Button>
                        </ConfirmDialog>
                    </div>
                </TableCell>
            </TableRow>
        </>
    )
}
