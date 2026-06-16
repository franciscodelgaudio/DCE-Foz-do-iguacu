'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, RotateCcw, Search, Trash2, UserCheck } from "lucide-react"
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
import {
    confirmRegistrationEntry,
    deleteRegistration,
    undoRegistrationEntry,
} from "@/lib/actions/eventRegistration"
import { RegistrationEditSheet } from "@/components/dashboard/events/[eventId]/RegistrationEditSheet"
import {
    getRegistrationStudent,
    registrationMatchesSearch,
} from "@/components/dashboard/events/registrationUtils"

function CheckInRow({ registration, isAdmin }) {
    const router = useRouter()
    const { name, ra } = getRegistrationStudent(registration)
    const checkedIn = Boolean(registration.entryConfirmedAt)

    async function handleConfirmEntry() {
        const result = await confirmRegistrationEntry(String(registration._id))
        if (result.success) {
            toast.success(result.message)
            router.refresh()
            return
        }

        toast.error(result.message)
    }

    async function handleUndoEntry() {
        const result = await undoRegistrationEntry(String(registration._id))
        if (result.success) {
            toast.success(result.message)
            router.refresh()
            return
        }

        toast.error(result.message)
    }

    async function handleDelete() {
        const result = await deleteRegistration(String(registration._id))
        if (result.success) {
            toast.success(result.message)
            router.refresh()
            return
        }

        toast.error(result.message)
    }

    return (
        <TableRow className={checkedIn ? "bg-emerald-50/50 hover:bg-emerald-50/70" : ""}>
            <TableCell className="min-w-[240px] whitespace-normal">
                <p className="break-words font-semibold leading-snug text-slate-900">{name}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">{registration.registrationNumber}</p>
            </TableCell>
            <TableCell className="min-w-28 font-medium text-slate-700">{ra}</TableCell>
            <TableCell className="min-w-44">
                {checkedIn ? (
                    <div className="space-y-1">
                        <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                            <UserCheck className="size-3" />
                            Entrada confirmada
                        </Badge>
                        <p className="text-xs text-emerald-700">
                            {new Date(registration.entryConfirmedAt).toLocaleString("pt-BR")}
                        </p>
                    </div>
                ) : (
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                        Entrada pendente
                    </Badge>
                )}
            </TableCell>
            <TableCell className="w-56">
                <div className="flex items-center justify-end gap-1">
                    {!checkedIn && (
                        <ConfirmDialog
                            title="Confirmar entrada"
                            subtitle={`Confirmar a entrada de ${name} (${ra})?`}
                            onClick={handleConfirmEntry}
                        >
                            <Button size="sm" className="h-9">
                                <CheckCircle2 className="size-4" />
                                Confirmar
                            </Button>
                        </ConfirmDialog>
                    )}
                    {isAdmin && checkedIn && (
                        <ConfirmDialog
                            title="Desfazer entrada"
                            subtitle={`Remover a confirmacao de entrada de ${name} (${ra})?`}
                            onClick={handleUndoEntry}
                        >
                            <Button variant="outline" size="sm" className="h-9">
                                <RotateCcw className="size-4" />
                                Desfazer
                            </Button>
                        </ConfirmDialog>
                    )}
                    {isAdmin && <RegistrationEditSheet registration={registration} />}
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

export function CheckInDisplay({ registrations, event, isAdmin = false }) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return registrations.filter((registration) => registrationMatchesSearch(registration, search))
    }, [registrations, search])

    const checkedInCount = useMemo(() => {
        return registrations.filter((registration) => registration.entryConfirmedAt).length
    }, [registrations])

    return (
        <div>
            <div className="border-b bg-white px-4 py-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href={`/dashboard/events/${event._id}/registrations`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        <UserCheck className="size-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900">Controle de entrada</h1>
                        <p className="truncate text-sm text-muted-foreground">{event.title}</p>
                    </div>
                </div>
            </div>

            <div className="border-b bg-gray-50/60 px-4 py-4 sm:px-6">
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                    <div className="rounded-lg border bg-white p-3">
                        <p className="text-2xl font-extrabold text-slate-800">{registrations.length}</p>
                        <p className="text-xs text-slate-500">Inscritos</p>
                    </div>
                    <div className="rounded-lg border bg-white p-3">
                        <p className="text-2xl font-extrabold text-emerald-700">{checkedInCount}</p>
                        <p className="text-xs text-slate-500">Entradas confirmadas</p>
                    </div>
                </div>
            </div>

            <div className="border-b bg-gray-50/60 px-4 py-3 sm:px-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, RA ou inscricao..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="px-4 py-4 sm:px-6">
                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-white py-14 text-center text-sm text-muted-foreground">
                        Nenhum inscrito encontrado.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead>Nome / inscricao</TableHead>
                                    <TableHead>RA</TableHead>
                                    <TableHead>Entrada</TableHead>
                                    <TableHead className="text-right">Acoes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((registration) => (
                                    <CheckInRow
                                        key={registration._id}
                                        registration={registration}
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
