'use client'

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { CheckCircle, PackageCheck, Truck, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { OrderDetailSheet } from "./OrderDetailSheet"
import { useRouter } from "next/navigation"
import { formatDate } from "@/components/ui/formatDate"
import { toast } from "sonner"
import { markOrderReady, markOrderDelivered } from "@/lib/actions/correioElegante"

const PACKAGE_LABELS = {
    cartinha: "Cartinha",
    rosa: "Rosa + Cartinha",
    bombom_cartinha: "Bombom + Cartinha",
    bombom_cartinha_rosa: "Bombom + Cartinha + Rosa",
}

const DELIVERY_STYLES = {
    not_ready: "bg-amber-100 text-amber-700 border-amber-200",
    ready: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const DELIVERY_LABELS = {
    not_ready: "A preparar",
    ready: "Pronto",
    delivered: "Entregue",
}

export function DeliveryOrderRow({ order, isAdmin = false, canMarkReady = false }) {
    const router = useRouter()
    const [sheetOpen, setSheetOpen] = useState(false)
    const deliveryStatus = order.deliveryStatus || "not_ready"

    async function handleMarkReady() {
        const result = await markOrderReady(order._id)
        if (result.success) {
            router.refresh()
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    async function handleMarkDelivered() {
        const result = await markOrderDelivered(order._id)
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
                <TableCell className="font-mono text-xs font-semibold text-[#2708ab]">
                    {order.orderNumber}
                </TableCell>
                <TableCell>
                    <span className="text-xs">{PACKAGE_LABELS[order.package] ?? order.package}</span>
                    <span className="ml-1.5 text-xs font-bold text-slate-500">
                        R$ {Number(order.price).toFixed(2).replace('.', ',')}
                    </span>
                </TableCell>
                <TableCell>
                    <p className="text-sm font-medium">{order.recipientName}</p>
                    {order.recipientCourse && (
                        <p className="text-xs text-slate-400">
                            {order.recipientCourse}{order.recipientYear ? ` · ${order.recipientYear}` : ""}
                        </p>
                    )}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm">{order.senderName}</p>
                        {order.isAnonymous && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                anônimo
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell className="max-w-[160px]">
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
                        className={DELIVERY_STYLES[deliveryStatus]}
                    >
                        {DELIVERY_LABELS[deliveryStatus]}
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
                        {canMarkReady && deliveryStatus === "not_ready" && (
                            <ConfirmDialog
                                title="Marcar como pronto"
                                subtitle={`Confirmar que o pedido ${order.orderNumber} de ${order.recipientName} está preparado e pronto para entrega?`}
                                onClick={handleMarkReady}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Marcar como pronto"
                                >
                                    <PackageCheck className="size-4" />
                                </Button>
                            </ConfirmDialog>
                        )}
                        {isAdmin && deliveryStatus === "ready" && (
                            <ConfirmDialog
                                title="Marcar como entregue"
                                subtitle={`Confirmar que o pedido ${order.orderNumber} foi entregue a ${order.recipientName}?`}
                                onClick={handleMarkDelivered}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    title="Marcar como entregue"
                                >
                                    <Truck className="size-4" />
                                </Button>
                            </ConfirmDialog>
                        )}
                        {deliveryStatus === "delivered" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="text-emerald-400"
                                title="Entregue"
                            >
                                <CheckCircle className="size-4" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            </TableRow>
        </>
    )
}
