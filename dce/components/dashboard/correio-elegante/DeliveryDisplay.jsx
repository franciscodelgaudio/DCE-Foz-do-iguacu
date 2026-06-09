'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import {
    Table, TableBody, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DeliveryOrderRow } from "./DeliveryOrderRow"
import { toast } from "sonner"
import {
    Heart, Search, Package, CheckCircle2, Clock, Truck,
} from "lucide-react"

const DELIVERY_FILTER_OPTIONS = [
    { value: "", label: "Todos os confirmados" },
    { value: "not_ready", label: "A preparar" },
    { value: "ready", label: "Prontos" },
    { value: "delivered", label: "Entregues" },
]

const PACKAGE_FILTER_OPTIONS = [
    { value: "", label: "Todos os pacotes" },
    { value: "cartinha", label: "Cartinha" },
    { value: "rosa", label: "Rosa + Cartinha" },
    { value: "bombom_cartinha", label: "Bombom + Cartinha" },
    { value: "bombom_cartinha_rosa", label: "Bombom + Cartinha + Rosa" },
]

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    )
}

export function DeliveryDisplay({ orders, stats, isAdmin = false, canMarkReady = false }) {
    const [search, setSearch] = useState("")
    const [deliveryFilter, setDeliveryFilter] = useState("")
    const [packageFilter, setPackageFilter] = useState("")

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const status = o.deliveryStatus || "not_ready"
            const matchesDelivery = !deliveryFilter || status === deliveryFilter
            const matchesPackage = !packageFilter || o.package === packageFilter
            const term = search.toLowerCase()
            const matchesSearch =
                !term ||
                o.orderNumber?.toLowerCase().includes(term) ||
                o.recipientName?.toLowerCase().includes(term) ||
                o.senderName?.toLowerCase().includes(term) ||
                o.recipientCourse?.toLowerCase().includes(term)
            return matchesDelivery && matchesPackage && matchesSearch
        })
    }, [orders, search, deliveryFilter, packageFilter])

    return (
        <div>
            {/* Page Header */}
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <Heart className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Correio Elegante</h1>
                            <p className="text-sm text-muted-foreground">
                                {stats.total} pedido{stats.total !== 1 ? "s" : ""} confirmado{stats.total !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b bg-white px-6">
                <div className="flex gap-0">
                    <Link
                        href="/dashboard/correio-elegante"
                        className="border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                    >
                        Pedidos
                    </Link>
                    <Link
                        href="/dashboard/correio-elegante/entrega"
                        className="border-b-2 border-[#2708ab] px-4 py-3 text-sm font-medium text-[#2708ab]"
                    >
                        Entregas
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 border-b bg-gray-50/60 px-6 py-4 sm:grid-cols-4">
                <StatCard icon={Package} label="Confirmados" value={stats.total} color="bg-[#2708ab]/10 text-[#2708ab]" />
                <StatCard icon={Clock} label="A preparar" value={stats.not_ready} color="bg-amber-100 text-amber-600" />
                <StatCard icon={Truck} label="Prontos" value={stats.ready} color="bg-blue-100 text-blue-600" />
                <StatCard icon={CheckCircle2} label="Entregues" value={stats.delivered} color="bg-emerald-100 text-emerald-600" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nº, destinatário, remetente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={deliveryFilter}
                    onChange={(e) => setDeliveryFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {DELIVERY_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <select
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {PACKAGE_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Count */}
            <div className="px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {filtered.length} pedido{filtered.length !== 1 ? "s" : ""} exibido{filtered.length !== 1 ? "s" : ""}
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Remetente</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhum pedido encontrado.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((order) => (
                            <DeliveryOrderRow key={order._id} order={order} isAdmin={isAdmin} canMarkReady={canMarkReady} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
