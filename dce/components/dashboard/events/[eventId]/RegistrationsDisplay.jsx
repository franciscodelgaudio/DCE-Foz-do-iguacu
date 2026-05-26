'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"
import {
    confirmRegistrationPayment,
    cancelRegistration,
    deleteRegistration,
    deleteManyRegistrations,
} from "@/lib/actions/eventRegistration"
import {
    ClipboardList, Search, Trash2, CheckCircle2, Clock, XCircle, Eye, ArrowLeft,
} from "lucide-react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link"

const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Todas as inscrições" },
    { value: "not_required", label: "Sem pagamento" },
    { value: "pending", label: "Aguardando pagamento" },
    { value: "confirmed", label: "Pagamento confirmado" },
    { value: "cancelled", label: "Canceladas" },
]

const STATUS_LABELS = {
    not_required: { label: "Confirmada", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    pending: { label: "Aguardando", color: "border-amber-200 bg-amber-50 text-amber-700" },
    confirmed: { label: "Pago", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    cancelled: { label: "Cancelada", color: "border-slate-200 bg-slate-50 text-slate-500" },
}

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

function AnswersSheet({ registration }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <Eye className="size-4" />
                </button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Inscrição {registration.registrationNumber}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4 px-1">
                    <p className="text-xs text-slate-500">
                        Enviada em {new Date(registration.createdAt).toLocaleString("pt-BR")}
                    </p>
                    {registration.answers?.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhuma resposta registrada.</p>
                    ) : (
                        registration.answers?.map((ans, i) => (
                            <div key={i} className="space-y-0.5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {ans.label}
                                </p>
                                <p className="text-sm text-slate-800">
                                    {ans.value === true
                                        ? "Sim"
                                        : ans.value === false
                                        ? "Não"
                                        : ans.value || "—"}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function RegistrationRow({ registration, selected, onSelectChange, requiresPayment }) {
    const router = useRouter()
    const status = STATUS_LABELS[registration.paymentStatus] ?? STATUS_LABELS.not_required

    async function handleConfirm() {
        const result = await confirmRegistrationPayment(String(registration._id))
        if (result.success) { toast.success(result.message); router.refresh() }
        else toast.error(result.message)
    }

    async function handleCancel() {
        const result = await cancelRegistration(String(registration._id))
        if (result.success) { toast.success(result.message); router.refresh() }
        else toast.error(result.message)
    }

    async function handleDelete() {
        const result = await deleteRegistration(String(registration._id))
        if (result.success) { toast.success(result.message); router.refresh() }
        else toast.error(result.message)
    }

    const firstAnswer = registration.answers?.[0]

    return (
        <TableRow className={selected ? "bg-blue-50/40" : ""}>
            <TableCell>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelectChange(String(registration._id))}
                    className="size-4 accent-[#2708ab]"
                />
            </TableCell>
            <TableCell className="font-mono text-sm">{registration.registrationNumber}</TableCell>
            <TableCell className="max-w-48 truncate text-sm">
                {firstAnswer ? `${firstAnswer.value}` : "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-500">
                {new Date(registration.createdAt).toLocaleDateString("pt-BR")}
            </TableCell>
            {requiresPayment && (
                <TableCell>
                    <Badge variant="outline" className={status.color}>{status.label}</Badge>
                </TableCell>
            )}
            <TableCell>
                <div className="flex items-center gap-1">
                    <AnswersSheet registration={registration} />
                    {requiresPayment && registration.paymentStatus === "pending" && (
                        <ConfirmDialog
                            title="Confirmar pagamento"
                            subtitle={`Confirmar pagamento da inscrição ${registration.registrationNumber}?`}
                            onClick={handleConfirm}
                        >
                            <button className="rounded p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                                <CheckCircle2 className="size-4" />
                            </button>
                        </ConfirmDialog>
                    )}
                    {registration.paymentStatus !== "cancelled" && registration.paymentStatus !== "not_required" && (
                        <ConfirmDialog
                            title="Cancelar inscrição"
                            subtitle={`Cancelar a inscrição ${registration.registrationNumber}?`}
                            onClick={handleCancel}
                        >
                            <button className="rounded p-1.5 text-slate-400 hover:bg-orange-50 hover:text-orange-500">
                                <XCircle className="size-4" />
                            </button>
                        </ConfirmDialog>
                    )}
                    <ConfirmDialog
                        title="Excluir inscrição"
                        subtitle={`Excluir permanentemente a inscrição ${registration.registrationNumber}?`}
                        onClick={handleDelete}
                    >
                        <button className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="size-4" />
                        </button>
                    </ConfirmDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}

export function RegistrationsDisplay({ registrations, event }) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedIds, setSelectedIds] = useState([])

    const requiresPayment = event.registration?.requiresPayment ?? false

    const stats = useMemo(() => {
        const total = registrations.length
        const pending = registrations.filter((r) => r.paymentStatus === "pending").length
        const confirmed = registrations.filter((r) => r.paymentStatus === "confirmed").length
        const cancelled = registrations.filter((r) => r.paymentStatus === "cancelled").length
        return { total, pending, confirmed, cancelled }
    }, [registrations])

    const filtered = useMemo(() => {
        return registrations.filter((r) => {
            const matchesStatus = !statusFilter || r.paymentStatus === statusFilter
            const term = search.toLowerCase()
            const matchesSearch =
                !term ||
                r.registrationNumber?.toLowerCase().includes(term) ||
                r.answers?.some((a) => String(a.value).toLowerCase().includes(term))
            return matchesStatus && matchesSearch
        })
    }, [registrations, search, statusFilter])

    const filteredIds = useMemo(() => filtered.map((r) => String(r._id)), [filtered])
    const allSelected = filteredIds.length > 0 && selectedIds.length === filteredIds.length
    const hasSelection = selectedIds.length > 0

    function toggleSelected(id) {
        setSelectedIds((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : filteredIds)
    }

    async function handleDeleteSelected() {
        const result = await deleteManyRegistrations(selectedIds)
        if (!result.success) { toast.error(result.message); return }
        setSelectedIds([])
        router.refresh()
        toast.success(result.message)
    }

    return (
        <div>
            {/* Header */}
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/dashboard/events/${event._id}`}
                            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <ClipboardList className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Inscrições</h1>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{event.title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {requiresPayment ? (
                <div className="grid grid-cols-2 gap-3 border-b bg-gray-50/60 px-6 py-4 sm:grid-cols-4">
                    <StatCard icon={ClipboardList} label="Total" value={stats.total} color="bg-[#2708ab]/10 text-[#2708ab]" />
                    <StatCard icon={Clock} label="Aguardando" value={stats.pending} color="bg-amber-100 text-amber-600" />
                    <StatCard icon={CheckCircle2} label="Pagos" value={stats.confirmed} color="bg-emerald-100 text-emerald-600" />
                    <StatCard icon={XCircle} label="Cancelados" value={stats.cancelled} color="bg-slate-100 text-slate-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 border-b bg-gray-50/60 px-6 py-4 sm:grid-cols-2">
                    <StatCard icon={ClipboardList} label="Total de inscrições" value={stats.total} color="bg-[#2708ab]/10 text-[#2708ab]" />
                    <StatCard icon={CheckCircle2} label="Confirmadas" value={stats.total - stats.cancelled} color="bg-emerald-100 text-emerald-600" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nº ou resposta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {requiresPayment && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        {STATUS_FILTER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Batch actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection ? `${selectedIds.length} selecionado(s)` : `${filtered.length} inscrição(ões) exibida(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir inscrições selecionadas"
                    subtitle={`Excluir permanentemente ${selectedIds.length} inscrição(ões)?`}
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
                        <TableHead>Nº Inscrição</TableHead>
                        <TableHead>Primeira resposta</TableHead>
                        <TableHead>Data</TableHead>
                        {requiresPayment && <TableHead>Pagamento</TableHead>}
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={requiresPayment ? 6 : 5} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhuma inscrição encontrada.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((reg) => (
                            <RegistrationRow
                                key={reg._id}
                                registration={reg}
                                selected={selectedIds.includes(String(reg._id))}
                                onSelectChange={toggleSelected}
                                requiresPayment={requiresPayment}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
