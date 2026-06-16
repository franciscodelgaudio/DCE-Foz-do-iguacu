'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
    confirmRegistrationPayment,
    cancelRegistration,
    deleteRegistration,
    deleteManyRegistrations,
} from "@/lib/actions/eventRegistration"
import {
    ClipboardList, Search, Trash2, CheckCircle2, Clock, XCircle, Eye, ArrowLeft, UserCheck,
} from "lucide-react"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link"
import { RegistrationEditSheet } from "@/components/dashboard/events/[eventId]/RegistrationEditSheet"
import {
    getRegistrationStudent,
    registrationMatchesSearch,
} from "@/components/dashboard/events/registrationUtils"

const STATUS_FILTER_OPTIONS = [
    { value: "", label: "Todas as inscricoes" },
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
        <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-white p-3 sm:p-4">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-md sm:size-10 ${color}`}>
                <Icon className="size-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xl font-extrabold text-slate-800 sm:text-2xl">{value}</p>
                <p className="truncate text-xs text-slate-500">{label}</p>
            </div>
        </div>
    )
}

function EntryBadge({ confirmedAt }) {
    if (!confirmedAt) {
        return (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                Entrada pendente
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <UserCheck className="size-3" />
            Entrada confirmada
        </Badge>
    )
}

function AnswersSheet({ registration, requiresPayment }) {
    const { name, ra } = getRegistrationStudent(registration)
    const status = STATUS_LABELS[registration.paymentStatus] ?? STATUS_LABELS.not_required

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                    <Eye className="size-4" />
                </button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Inscricao {registration.registrationNumber}</SheetTitle>
                </SheetHeader>
                <div className="space-y-5 px-4 pb-6">
                    <div className="rounded-lg border bg-slate-50 p-4">
                        <p className="text-base font-semibold leading-snug text-slate-900">{name}</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">{ra}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {requiresPayment && (
                                <Badge variant="outline" className={status.color}>{status.label}</Badge>
                            )}
                            <EntryBadge confirmedAt={registration.entryConfirmedAt} />
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">
                        Enviada em {new Date(registration.createdAt).toLocaleString("pt-BR")}
                    </p>

                    {registration.answers?.length === 0 ? (
                        <p className="text-sm text-slate-400">Nenhuma resposta registrada.</p>
                    ) : (
                        <div className="space-y-3">
                            {registration.answers?.map((ans, i) => (
                                <div key={i} className="rounded-lg border bg-white p-3">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        {ans.label}
                                    </p>
                                    <p className="mt-1 break-words text-sm text-slate-800">
                                        {ans.value === true
                                            ? "Sim"
                                            : ans.value === false
                                            ? "Nao"
                                            : ans.value || "-"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-lg border bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-500">IP</p>
                        <p className="mt-1 break-all text-sm text-slate-800">
                            {registration.ipAddress || "Nao identificado"}
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function RegistrationRow({ registration, selected, onSelectChange, requiresPayment, isAdmin }) {
    const router = useRouter()
    const { name, ra } = getRegistrationStudent(registration)
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

    return (
        <TableRow className={selected ? "bg-[#2708ab]/5 hover:bg-[#2708ab]/5" : ""}>
            {isAdmin && (
                <TableCell className="w-10">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelectChange(String(registration._id))}
                        className="size-4 accent-[#2708ab]"
                        aria-label={`Selecionar ${name}`}
                    />
                </TableCell>
            )}
            <TableCell className="min-w-[240px] whitespace-normal">
                <p className="break-words font-semibold leading-snug text-slate-900">{name}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">{registration.registrationNumber}</p>
            </TableCell>
            <TableCell className="min-w-28 font-medium text-slate-700">{ra}</TableCell>
            <TableCell className="min-w-32 text-slate-600">
                {new Date(registration.createdAt).toLocaleDateString("pt-BR")}
            </TableCell>
            {requiresPayment && (
                <TableCell className="min-w-32">
                    <Badge variant="outline" className={status.color}>{status.label}</Badge>
                </TableCell>
            )}
            <TableCell className="min-w-40">
                <EntryBadge confirmedAt={registration.entryConfirmedAt} />
            </TableCell>
            <TableCell className="w-36">
                <div className="flex items-center justify-end gap-1">
                    <AnswersSheet registration={registration} requiresPayment={requiresPayment} />
                    {isAdmin && <RegistrationEditSheet registration={registration} />}
                    {requiresPayment && registration.paymentStatus === "pending" && (
                        <ConfirmDialog
                            title="Confirmar pagamento"
                            subtitle={`Confirmar pagamento da inscricao ${registration.registrationNumber}?`}
                            onClick={handleConfirm}
                        >
                            <button className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-emerald-50 hover:text-emerald-600">
                                <CheckCircle2 className="size-4" />
                            </button>
                        </ConfirmDialog>
                    )}
                    {registration.paymentStatus !== "cancelled" && registration.paymentStatus !== "not_required" && (
                        <ConfirmDialog
                            title="Cancelar inscricao"
                            subtitle={`Cancelar a inscricao ${registration.registrationNumber}?`}
                            onClick={handleCancel}
                        >
                            <button className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-orange-50 hover:text-orange-500">
                                <XCircle className="size-4" />
                            </button>
                        </ConfirmDialog>
                    )}
                    {isAdmin && (
                        <ConfirmDialog
                            title="Excluir inscricao"
                            subtitle={`Excluir permanentemente a inscricao ${registration.registrationNumber}?`}
                            onClick={handleDelete}
                        >
                            <button className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-500">
                                <Trash2 className="size-4" />
                            </button>
                        </ConfirmDialog>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

export function RegistrationsDisplay({ registrations, event, isAdmin = false }) {
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
        const checkedIn = registrations.filter((r) => r.entryConfirmedAt).length
        return { total, pending, confirmed, cancelled, checkedIn }
    }, [registrations])

    const filtered = useMemo(() => {
        return registrations.filter((r) => {
            const matchesStatus = !statusFilter || r.paymentStatus === statusFilter
            return matchesStatus && registrationMatchesSearch(r, search)
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
            <div className="border-b bg-white px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href={`/dashboard/events/${event._id}`}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <ClipboardList className="size-5 text-[#2708ab]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold text-gray-900">Inscricoes</h1>
                            <p className="truncate text-sm text-muted-foreground">{event.title}</p>
                        </div>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={`/dashboard/events/${event._id}/registrations/entrada`}>
                            <UserCheck className="size-4" />
                            Controle de entrada
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b bg-gray-50/60 px-4 py-4 sm:grid-cols-4 sm:px-6">
                <StatCard icon={ClipboardList} label="Total" value={stats.total} color="bg-[#2708ab]/10 text-[#2708ab]" />
                <StatCard icon={UserCheck} label="Entradas" value={stats.checkedIn} color="bg-emerald-100 text-emerald-600" />
                {requiresPayment ? (
                    <>
                        <StatCard icon={Clock} label="Aguardando" value={stats.pending} color="bg-amber-100 text-amber-600" />
                        <StatCard icon={CheckCircle2} label="Pagos" value={stats.confirmed} color="bg-emerald-100 text-emerald-600" />
                    </>
                ) : (
                    <>
                        <StatCard icon={CheckCircle2} label="Confirmadas" value={stats.total - stats.cancelled} color="bg-emerald-100 text-emerald-600" />
                        <StatCard icon={XCircle} label="Canceladas" value={stats.cancelled} color="bg-slate-100 text-slate-500" />
                    </>
                )}
            </div>

            <div className="flex flex-col gap-3 border-b bg-gray-50/60 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, RA ou inscricao..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {requiresPayment && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring sm:w-auto"
                    >
                        {STATUS_FILTER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                {isAdmin ? (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="size-4 accent-[#2708ab]"
                        />
                        {hasSelection ? `${selectedIds.length} selecionado(s)` : `${filtered.length} inscricao(oes) exibida(s)`}
                    </label>
                ) : (
                    <p className="text-sm text-muted-foreground">{filtered.length} inscricao(oes) exibida(s)</p>
                )}
                {isAdmin && (
                    <ConfirmDialog
                        title="Excluir inscricoes selecionadas"
                        subtitle={`Excluir permanentemente ${selectedIds.length} inscricao(oes)?`}
                        onClick={handleDeleteSelected}
                    >
                        <Button variant="destructive" disabled={!hasSelection} size="sm" className="w-full sm:w-auto">
                            <Trash2 className="size-4" />
                            Excluir selecionados
                        </Button>
                    </ConfirmDialog>
                )}
            </div>

            <div className="px-4 pb-6 sm:px-6">
                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-white py-14 text-center text-sm text-muted-foreground">
                        Nenhuma inscricao encontrada.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    {isAdmin && (
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="size-4 accent-[#2708ab]"
                                                aria-label="Selecionar todas as inscricoes"
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead>Nome / inscricao</TableHead>
                                    <TableHead>RA</TableHead>
                                    <TableHead>Data</TableHead>
                                    {requiresPayment && <TableHead>Pagamento</TableHead>}
                                    <TableHead>Entrada</TableHead>
                                    <TableHead className="text-right">Acoes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((reg) => (
                                    <RegistrationRow
                                        key={reg._id}
                                        registration={reg}
                                        selected={selectedIds.includes(String(reg._id))}
                                        onSelectChange={toggleSelected}
                                        requiresPayment={requiresPayment}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
