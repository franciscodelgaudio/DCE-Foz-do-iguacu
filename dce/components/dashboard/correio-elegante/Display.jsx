'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Table, TableBody, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { OrderRow } from "./OrderRow"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"
import { deleteManyOrders } from "@/lib/actions/correioElegante"
import { updateSettings } from "@/lib/actions/settings"
import {
    Heart, Search, Trash2, Settings, Package, CheckCircle2, Clock, XCircle,
} from "lucide-react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet"

const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Todos os pedidos" },
    { value: "pending", label: "Aguardando pagamento" },
    { value: "confirmed", label: "Pagamento confirmado" },
    { value: "cancelled", label: "Cancelados" },
]

const PIX_TYPE_OPTIONS = [
    { value: "email", label: "E-mail" },
    { value: "phone", label: "Telefone / WhatsApp" },
    { value: "cpf", label: "CPF / CNPJ" },
    { value: "random", label: "Chave Aleatória" },
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

export function Display({ orders, stats, settings: initialSettings }) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedIds, setSelectedIds] = useState([])
    const [settingsForm, setSettingsForm] = useState({
        pixKey: initialSettings?.pixKey ?? "",
        pixKeyType: initialSettings?.pixKeyType ?? "email",
        pixRecipientName: initialSettings?.pixRecipientName ?? "",
        correioEleganteEnabled: initialSettings?.correioEleganteEnabled ?? false,
    })
    const [savingSettings, setSavingSettings] = useState(false)

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const matchesStatus = !statusFilter || o.paymentStatus === statusFilter
            const term = search.toLowerCase()
            const matchesSearch =
                !term ||
                o.orderNumber?.toLowerCase().includes(term) ||
                o.senderName?.toLowerCase().includes(term) ||
                o.recipientName?.toLowerCase().includes(term) ||
                o.recipientClass?.toLowerCase().includes(term)
            return matchesStatus && matchesSearch
        })
    }, [orders, search, statusFilter])

    const orderIds = useMemo(() => filtered.map((o) => String(o._id)), [filtered])
    const allSelected = orderIds.length > 0 && selectedIds.length === orderIds.length
    const hasSelection = selectedIds.length > 0

    function toggleSelected(id) {
        const str = String(id)
        setSelectedIds((cur) => cur.includes(str) ? cur.filter((x) => x !== str) : [...cur, str])
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : orderIds)
    }

    async function handleDeleteSelected() {
        const result = await deleteManyOrders(selectedIds)
        if (!result.success) { toast.error(result.message); return }
        setSelectedIds([])
        router.refresh()
        toast.success(result.message)
    }

    async function handleSaveSettings() {
        setSavingSettings(true)
        const result = await updateSettings(settingsForm)
        setSavingSettings(false)
        if (result.success) {
            toast.success(result.message)
            router.refresh()
        } else {
            toast.error(result.message)
        }
    }

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
                                {stats.total} pedido{stats.total !== 1 ? "s" : ""} no total
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={initialSettings?.correioEleganteEnabled
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"}
                        >
                            {initialSettings?.correioEleganteEnabled ? "Pedidos abertos" : "Pedidos fechados"}
                        </Badge>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="size-4" />
                                    Configurações
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Configurações do Correio Elegante</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-5 px-1">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-medium text-slate-800">Pedidos abertos</p>
                                            <p className="text-xs text-slate-500">Exibe o banner na home e permite novos pedidos</p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSettingsForm((f) => ({
                                                    ...f,
                                                    correioEleganteEnabled: !f.correioEleganteEnabled,
                                                }))
                                            }
                                            className={[
                                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                                settingsForm.correioEleganteEnabled ? "bg-[#2708ab]" : "bg-slate-200",
                                            ].join(" ")}
                                        >
                                            <span
                                                className={[
                                                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                                    settingsForm.correioEleganteEnabled ? "translate-x-6" : "translate-x-1",
                                                ].join(" ")}
                                            />
                                        </button>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Tipo da chave PIX</Label>
                                        <select
                                            value={settingsForm.pixKeyType}
                                            onChange={(e) =>
                                                setSettingsForm((f) => ({ ...f, pixKeyType: e.target.value }))
                                            }
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            {PIX_TYPE_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Chave PIX</Label>
                                        <Input
                                            value={settingsForm.pixKey}
                                            onChange={(e) =>
                                                setSettingsForm((f) => ({ ...f, pixKey: e.target.value }))
                                            }
                                            placeholder="Ex: foz.dce@gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Nome do favorecido</Label>
                                        <Input
                                            value={settingsForm.pixRecipientName}
                                            onChange={(e) =>
                                                setSettingsForm((f) => ({
                                                    ...f,
                                                    pixRecipientName: e.target.value,
                                                }))
                                            }
                                            placeholder="Ex: DCE UNIOESTE Foz"
                                        />
                                    </div>
                                </div>
                                <SheetFooter className="mt-6">
                                    <SheetClose asChild>
                                        <Button variant="outline">Cancelar</Button>
                                    </SheetClose>
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={savingSettings}
                                        className="bg-[#2708ab] hover:bg-[#2708ab]/90"
                                    >
                                        {savingSettings ? "Salvando..." : "Salvar"}
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 border-b bg-gray-50/60 px-6 py-4 sm:grid-cols-4">
                <StatCard icon={Package} label="Total" value={stats.total} color="bg-[#2708ab]/10 text-[#2708ab]" />
                <StatCard icon={Clock} label="Aguardando" value={stats.pending} color="bg-amber-100 text-amber-600" />
                <StatCard icon={CheckCircle2} label="Confirmados" value={stats.confirmed} color="bg-emerald-100 text-emerald-600" />
                <StatCard icon={XCircle} label="Cancelados" value={stats.cancelled} color="bg-slate-100 text-slate-500" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nº, nome, turma..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {STATUS_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Batch actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection ? `${selectedIds.length} selecionado(s)` : `${filtered.length} pedido(s) exibido(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir pedidos selecionados"
                    subtitle={`Excluir permanentemente ${selectedIds.length} pedido(s)? Esta ação não pode ser desfeita.`}
                    onClick={handleDeleteSelected}
                >
                    <Button variant="destructive" disabled={!hasSelection} size="sm">
                        <Trash2 className="size-4" />
                        Excluir selecionados
                    </Button>
                </ConfirmDialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                className="size-4 accent-[#2708ab]"
                                aria-label="Selecionar todos"
                            />
                        </TableHead>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Remetente</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhum pedido encontrado.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((order) => (
                            <OrderRow
                                key={order._id}
                                order={order}
                                selected={selectedIds.includes(String(order._id))}
                                onSelectChange={toggleSelected}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
